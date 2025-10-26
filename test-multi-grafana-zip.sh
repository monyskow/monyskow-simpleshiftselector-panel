#!/bin/bash

# Script to test plugin from a zip file across multiple Grafana versions
# This simulates how the plugin would be installed from the Grafana catalog

set -e

# Function to handle errors but allow continuing
handle_error() {
    set +e
    "$@"
    local status=$?
    set -e
    return $status
}

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
TEMP_EXTRACT_DIR="$PROJECT_DIR/.tmp-plugin-extract"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Multi-Grafana ZIP Test Script${NC}"
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

# Function to show usage
show_usage() {
    echo "Usage: $0 <path-to-plugin.zip> [command]"
    echo ""
    echo "Arguments:"
    echo "  <path-to-plugin.zip>  - Path to the plugin zip file to test"
    echo ""
    echo "Commands:"
    echo "  (no command)  - Start all Grafana containers with the plugin"
    echo "  stop          - Stop all running containers"
    echo "  clean         - Remove all containers and cleanup temp files"
    echo "  logs <ver>    - Follow logs for specific version (e.g., logs 12.2.1)"
    echo "  help          - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dist/monyskow-simpleshiftselector-panel-1.0.0.zip"
    echo "  $0 /path/to/plugin.zip stop"
    echo "  $0 /path/to/plugin.zip logs 12.2.1"
    echo ""
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
        container_name="${PLUGIN_NAME}-grafana-${version}-zip"

        if docker ps -a --format '{{.Names}}' | grep -q "^${container_name}$"; then
            echo "  Removing container: $container_name"
            docker rm -f "$container_name" > /dev/null 2>&1 || true
        fi
    done
    echo -e "${GREEN}✓${NC} Cleanup complete\n"
}

# Function to clean up temp extraction directory
cleanup_temp_dir() {
    if [ -d "$TEMP_EXTRACT_DIR" ]; then
        print_status "Cleaning up temporary extraction directory..."
        rm -rf "$TEMP_EXTRACT_DIR"
        echo -e "${GREEN}✓${NC} Temp directory cleaned\n"
    fi
}

# Function to extract and prepare plugin from zip
prepare_plugin_from_zip() {
    local zip_file=$1

    print_status "Preparing plugin from zip file..."

    # Verify zip file exists
    if [ ! -f "$zip_file" ]; then
        print_error "Zip file not found: $zip_file"
        exit 1
    fi

    # Clean up any existing temp directory
    rm -rf "$TEMP_EXTRACT_DIR"
    mkdir -p "$TEMP_EXTRACT_DIR"

    # Extract the zip file
    echo "  Extracting: $zip_file"
    local temp_unzip="$TEMP_EXTRACT_DIR/unzipped"
    mkdir -p "$temp_unzip"
    unzip -q "$zip_file" -d "$temp_unzip"

    # Check if extraction was successful
    if [ ! -d "$temp_unzip" ] || [ -z "$(ls -A "$temp_unzip")" ]; then
        print_error "Failed to extract zip file or zip is empty"
        cleanup_temp_dir
        exit 1
    fi

    # Check for plugin.json in the extracted directory
    # It might be at root or in a subdirectory
    local plugin_dir=""

    if [ -f "$temp_unzip/plugin.json" ]; then
        # Plugin files are at the root of the zip
        plugin_dir="$temp_unzip"
    else
        # Look for plugin.json in subdirectories (common for Grafana plugins)
        plugin_dir=$(find "$temp_unzip" -name "plugin.json" -type f -exec dirname {} \; | head -1)

        if [ -z "$plugin_dir" ]; then
            print_error "Invalid plugin structure - plugin.json not found in zip"
            cleanup_temp_dir
            exit 1
        fi
    fi

    # Move plugin files to the extraction directory root
    echo "  Found plugin at: $plugin_dir"
    mv "$plugin_dir"/* "$TEMP_EXTRACT_DIR/" 2>/dev/null || true
    mv "$plugin_dir"/.[!.]* "$TEMP_EXTRACT_DIR/" 2>/dev/null || true  # Move hidden files
    rm -rf "$temp_unzip"

    # Final verification
    if [ ! -f "$TEMP_EXTRACT_DIR/plugin.json" ]; then
        print_error "Failed to prepare plugin structure"
        cleanup_temp_dir
        exit 1
    fi

    echo -e "${GREEN}✓${NC} Plugin extracted successfully"
    echo -e "  Location: $TEMP_EXTRACT_DIR\n"
}

# Function to start Grafana container
start_grafana_container() {
    local version=$1
    local image=$2
    local port=$3
    local container_name="${PLUGIN_NAME}-grafana-${version}-zip"

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
        -v "${TEMP_EXTRACT_DIR}:/var/lib/grafana/plugins/${PLUGIN_NAME}" \
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
        echo -e "    Container: ${PLUGIN_NAME}-grafana-${version}-zip"
        echo ""
    done

    echo -e "${YELLOW}Notes:${NC}"
    echo "  - Anonymous auth is enabled (no login required)"
    echo "  - Plugin is mounted from: $TEMP_EXTRACT_DIR"
    echo "  - To view logs: docker logs ${PLUGIN_NAME}-grafana-<version>-zip"
    echo "  - To stop all: docker stop \$(docker ps -q --filter name=${PLUGIN_NAME}-grafana-)"
    echo "  - To remove all: docker rm \$(docker ps -aq --filter name=${PLUGIN_NAME}-grafana-)"
    echo "  - To cleanup: $0 <zip-file> clean"
    echo ""
}

# Main execution
main() {
    local zip_file=$1

    if [ -z "$zip_file" ]; then
        print_error "No zip file specified"
        echo ""
        show_usage
        exit 1
    fi

    check_docker
    cleanup_containers
    prepare_plugin_from_zip "$zip_file"

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
ZIP_FILE="${1:-}"
COMMAND="${2:-}"

# If first arg looks like a command (not a file path), show usage
if [ -n "$ZIP_FILE" ] && [[ "$ZIP_FILE" =~ ^(stop|clean|logs|help)$ ]]; then
    COMMAND="$ZIP_FILE"
    ZIP_FILE=""
fi

case "$COMMAND" in
    stop)
        print_status "Stopping all Grafana containers..."
        docker stop $(docker ps -q --filter "name=${PLUGIN_NAME}-grafana-.*-zip") 2>/dev/null || echo "No containers to stop"
        echo -e "${GREEN}✓${NC} All containers stopped\n"
        ;;
    clean)
        print_status "Removing all Grafana containers..."
        docker rm -f $(docker ps -aq --filter "name=${PLUGIN_NAME}-grafana-.*-zip") 2>/dev/null || echo "No containers to remove"
        echo -e "${GREEN}✓${NC} All containers removed\n"
        cleanup_temp_dir
        ;;
    logs)
        if [ -z "$3" ]; then
            print_error "Please specify version (e.g., $0 <zip-file> logs 12.2.1)"
            exit 1
        fi
        docker logs -f "${PLUGIN_NAME}-grafana-$3-zip"
        ;;
    help)
        show_usage
        ;;
    "")
        main "$ZIP_FILE"
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        echo ""
        show_usage
        exit 1
        ;;
esac
