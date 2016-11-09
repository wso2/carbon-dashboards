# UUF Portal

UUF Portal is UUF based carbon-dashboard component which runs on WSO2 Carbon 5. 

## Architecture

There won't be single app which develop for dashboard related tasks. There will be components for each of major areas which listed below.

1. Dashboard Viewer
2. Dashboard Editor
3. Widget Generation

## Dashboard JSON

Dashboard related data is stored in a json format for easy readability and configurability.
```javascript
{
        "name": "",
        "id": "",
        "version": "",
        "description": "",
        "blocks": [{
            "height": 0,
            "id": "",
            "width": 0,
            "x": 0,
            "y": 0
        }, {
            "height": 0,
            "id": "",
            "width": 0,
            "x": 0,
            "y": 0
        }, {
            "height": 0,
            "id": "",
            "width": 0,
            "x": 0,
            "y": 0
        }],
        "widgets": {
          "a": {
            "id": "",
            "url": "",
            "permission": []
          },
          "b": {
            "id": "",
            "url": "",
            "permission": []
          },
          "c": {
            "id": "",
            "url": "",
            "permission": []
          }
        },
        "permission": {
            "editor": [],
            "viewer": [],
            "owner": []
        }
}
```
This json can be extended as to the changes in requirements that will come in future.