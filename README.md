# serverless-api-gateway-integration-headers
This plugin give you ability manipulate integration and request header in serverless cloud formation json.

**Command:**
- replaceHeaders
- deleteHeaders

**Install**
```
npm i serverless-api-gateway-integration-headers
```

**Initialize**
```
plugins:
  - serverless-api-gateway-integration-headers
```

**How to use**
1. Replace Headers
```
serverless replaceHeaders --headers '{"integration.request.header.x-type" : "context.authorizer.x-type", "integration.request.header.x-userid" : "context.authorizer.x-userid"}'
```

2. Delete Headers
```
serverless deleteHeaders --headers 'method.request.header.x-type,method.request.header.x-userid'
```
