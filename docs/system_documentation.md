# MoveSmart-Ke System Documentation

## Overview
The MoveSmart-Ke system is designed to collect live traffic incident data from the TomTom API and store it in a PostgreSQL database. This data is utilized for training predictive analytics models.

## Components

### UserProfile Component
- Updated to display dynamic user data from localStorage.
- Includes fallbacks for demo and authenticated users.
- Ensures profile reflects the signed-in user.
- Editable fields are initialized from this dynamic data for a consistent user experience.

### Database Models

#### Incident and Related Models
- Existing models reviewed to ensure compatibility with live data collection.

#### Enhanced Models
- `LiveIncidentData`: Stores live incident information.
- `TrafficFlowData`: Stores traffic flow metrics.
- `DataCollectionLog`: Logs data collection activities and success status.

### Integration with TomTom API
- A service class developed to fetch live incidents and traffic flow data from TomTom API.
- Includes coordinate parsing, validation, and incident type categorization.
- Corrects coordinate handling using robust checks and parsed float lat/lon values.

### Data Collection
- **LiveDataCollector Service**: A key service to collect and store data.
- **Django Management Command**: `collect_traffic_data` enables terminal-based data collection.
  - Supports city-specific or combined data collection types.
  - Offers verbose output mode.

### Automation & Tasks
- Celery tasks automate periodic data collection, clean old data, and generate collection reports.

### Requirements
- Compatible versions of `numpy`, `pandas`, `scikit-learn` included in the requirements.
- All necessary packages are installed and migrations applied successfully.

## Testing & Validation
- Initial tests found errors with coordinate handling.
- Enhanced coordinate parsing and validation mechanism implemented.
- Successfully corrected the coordinate assignment using parsed values.

## How to Use

### Running Data Collection
1. Open your terminal and navigate to the project directory.
2. Execute the following command to collect traffic data:
   ```
   python manage.py collect_traffic_data --city=NAIROBI --type=incidents
   ```
   - Use `--city` to specify the city. Supported cities include NAIROBI, MOMBASA, etc.
   - Use `--type` to choose between `incidents`, `traffic_flow`, or `all`.
3. For verbose output, add `--verbose` to the command.

### Automating Data Collection
- Ensure Celery is running with the appropriate settings to execute scheduled tasks.

## Conclusion
The system is ready for robust data gathering and valuable for predictive analytics applications. Follow this guide to extend, maintain or use the system effectively for your needs. Happy Data Collecting!
