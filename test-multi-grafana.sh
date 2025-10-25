#!/bin/bash

# Script to build, sign plugin and run multiple Grafana versions in containers
# Each container runs on a different port with the plugin installed

set -e

# Function to handle errors but allow continuing
handle_error() {
    set +e
    "$@"
    local status=$?
    set -e
    return $status
}

# Load environment variables from .env file if it exists
if [ -f .env ]; then
    echo "Loading environment variables from .env file..."
    set -a
    source .env
    set +a
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Grafana versions to test
# Format: "version:image:port"
GRAFANA_VERSIONS=(
    "12.3.0-18788022224:grafana/grafana-dev:3001"
    "12.2.1:grafana/grafana-enterprise:3002"
    "12.0.6:grafana/grafana-enterprise:3003"
    "11.4.8:grafana/grafana-enterprise:3004"
    "11.1.13:grafana/grafana-enterprise:3005"
    "10.4.19:grafana/grafana-enterprise:3006"
)

PLUGIN_NAME="monyskow-simpleshiftselector-panel"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="$PROJECT_DIR/dist"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Multi-Grafana Version Test Script${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to print status
print_status() {
    echo -e "${GREEN}==>${NC} $1"
}

print_error() {
    echo -e "${RED}ERROR:${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}WARNING:${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    print_status "Checking Docker..."
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    echo -e "${GREEN}✓${NC} Docker is running\n"
}

# Function to clean up existing containers
cleanup_containers() {
    print_status "Cleaning up existing containers..."
    for version_info in "${GRAFANA_VERSIONS[@]}"; do
        IFS=':' read -r version image port <<< "$version_info"
        container_name="${PLUGIN_NAME}-grafana-${version}"

        if docker ps -a --format '{{.Names}}' | grep -q "^${container_name}$"; then
            echo "  Removing container: $container_name"
            docker rm -f "$container_name" > /dev/null 2>&1 || true
        fi
    done
    echo -e "${GREEN}✓${NC} Cleanup complete\n"
}

# Function to build the plugin
build_plugin() {
    print_status "Building plugin..."
    cd "$PROJECT_DIR"

    # Clean dist directory
    rm -rf "$DIST_DIR"

    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "  Installing dependencies..."
        npm install
    fi

    # Build the plugin
    echo "  Running build..."
    npm run build

    if [ ! -d "$DIST_DIR" ]; then
        print_error "Build failed - dist directory not created"
        exit 1
    fi

    echo -e "${GREEN}✓${NC} Plugin built successfully\n"
}

# Function to sign the plugin
sign_plugin() {
    print_status "Signing plugin..."

    # Check if GRAFANA_ACCESS_POLICY_TOKEN is set
    if [ -z "$GRAFANA_ACCESS_POLICY_TOKEN" ]; then
        print_warning "GRAFANA_ACCESS_POLICY_TOKEN not set. Plugin will run unsigned."
        print_warning "Set the token in .env file or: export GRAFANA_ACCESS_POLICY_TOKEN=your_token"
        echo -e "${YELLOW}Skipping signing...${NC}\n"
        return
    fi

    cd "$PROJECT_DIR"

    # Try to sign, but don't fail if it errors (signing requires rootUrls for local dev)
    set +e
    npm run sign > /tmp/sign-output.log 2>&1
    local sign_status=$?
    set -e

    # Check if signing succeeded
    if [ $sign_status -eq 0 ] && [ -f "$DIST_DIR/MANIFEST.txt" ]; then
        echo -e "${GREEN}✓${NC} Plugin signed successfully\n"
    else
        # Check if error is about rootUrls (expected for local dev)
        if grep -q "rootUrls" /tmp/sign-output.log 2>/dev/null; then
            echo ""
            print_warning "Plugin signing requires 'rootUrls' field for local development."
            print_warning "This is only needed for private plugins. For public catalog submission,"
            print_warning "the plugin will be signed automatically during the release process."
            echo -e "${YELLOW}Running with unsigned plugin (allowed for local testing)${NC}\n"
        else
            echo ""
            print_warning "Signing failed. Check output above for details."
            echo -e "${YELLOW}Continuing with unsigned plugin...${NC}\n"
        fi
    fi

    # Clean up temp file
    rm -f /tmp/sign-output.log
}

# Function to start Grafana container
start_grafana_container() {
    local version=$1
    local image=$2
    local port=$3
    local container_name="${PLUGIN_NAME}-grafana-${version}"

    print_status "Starting Grafana $version on port $port..."

    # Create container
    docker run -d \
        --name "$container_name" \
        -p "${port}:3000" \
        -e "GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=${PLUGIN_NAME}" \
        -e "GF_LOG_LEVEL=debug" \
        -e "GF_LOG_FILTERS=plugin.${PLUGIN_NAME}:debug" \
        -e "GF_AUTH_ANONYMOUS_ENABLED=true" \
        -e "GF_AUTH_ANONYMOUS_ORG_ROLE=Admin" \
        -e "GF_AUTH_BASIC_ENABLED=false" \
        -e "GF_USERS_DEFAULT_THEME=light" \
        -v "${DIST_DIR}:/var/lib/grafana/plugins/${PLUGIN_NAME}" \
        "${image}:${version}" \
        > /dev/null

    echo -e "  ${GREEN}✓${NC} Container started: $container_name"
    echo -e "    URL: ${BLUE}http://localhost:${port}${NC}"
}

# Function to wait for containers to be healthy
wait_for_containers() {
    print_status "Waiting for Grafana instances to start..."

    local max_wait=60
    local waited=0

    for version_info in "${GRAFANA_VERSIONS[@]}"; do
        IFS=':' read -r version image port <<< "$version_info"

        echo -n "  Checking port $port..."
        while ! curl -s "http://localhost:${port}/api/health" > /dev/null 2>&1; do
            if [ $waited -ge $max_wait ]; then
                echo -e " ${RED}✗${NC} (timeout)"
                break
            fi
            sleep 2
            waited=$((waited + 2))
            echo -n "."
        done

        if curl -s "http://localhost:${port}/api/health" > /dev/null 2>&1; then
            echo -e " ${GREEN}✓${NC}"
        fi
        waited=0
    done

    echo ""
}

# Function to display summary
display_summary() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  All Grafana instances are running!${NC}"
    echo -e "${BLUE}========================================${NC}\n"

    echo "Access your Grafana instances at:"
    echo ""

    for version_info in "${GRAFANA_VERSIONS[@]}"; do
        IFS=':' read -r version image port <<< "$version_info"
        echo -e "  ${GREEN}Grafana $version${NC}"
        echo -e "    URL:       ${BLUE}http://localhost:${port}${NC}"
        echo -e "    Container: ${PLUGIN_NAME}-grafana-${version}"
        echo ""
    done

    echo -e "${YELLOW}Notes:${NC}"
    echo "  - Anonymous auth is enabled (no login required)"
    echo "  - Plugin is mounted from: $DIST_DIR"
    echo "  - To view logs: docker logs ${PLUGIN_NAME}-grafana-<version>"
    echo "  - To stop all: docker stop \$(docker ps -q --filter name=${PLUGIN_NAME}-grafana-)"
    echo "  - To remove all: docker rm \$(docker ps -aq --filter name=${PLUGIN_NAME}-grafana-)"
    echo ""
}

# Main execution
main() {
    check_docker
    cleanup_containers
    build_plugin
    sign_plugin

    echo -e "${BLUE}Starting Grafana containers...${NC}\n"

    for version_info in "${GRAFANA_VERSIONS[@]}"; do
        IFS=':' read -r version image port <<< "$version_info"
        start_grafana_container "$version" "$image" "$port"
    done

    echo ""
    wait_for_containers
    display_summary
}

# Handle script arguments
case "${1:-}" in
    stop)
        print_status "Stopping all Grafana containers..."
        docker stop $(docker ps -q --filter "name=${PLUGIN_NAME}-grafana-") 2>/dev/null || echo "No containers to stop"
        echo -e "${GREEN}✓${NC} All containers stopped\n"
        ;;
    clean)
        print_status "Removing all Grafana containers..."
        docker rm -f $(docker ps -aq --filter "name=${PLUGIN_NAME}-grafana-") 2>/dev/null || echo "No containers to remove"
        echo -e "${GREEN}✓${NC} All containers removed\n"
        ;;
    logs)
        if [ -z "$2" ]; then
            print_error "Please specify version (e.g., ./test-multi-grafana.sh logs 12.2.1)"
            exit 1
        fi
        docker logs -f "${PLUGIN_NAME}-grafana-$2"
        ;;
    help)
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  (no args)  - Build, sign and start all Grafana containers"
        echo "  stop       - Stop all running containers"
        echo "  clean      - Remove all containers"
        echo "  logs <ver> - Follow logs for specific version (e.g., logs 12.2.1)"
        echo "  help       - Show this help message"
        echo ""
        ;;
    *)
        main
        ;;
esac
