# Ghost Storage S3

## Installation

```
git clone git@github.com:dotronglong/ghost-storage-s3.git current/core/server/adapters/storage/s3
cd current/core/server/adapters/storage/s3 && yarn install
cp -pr node_modules/* ../../../../../node_modules
```

## Configuration

### File

```json
{
  // ...
  "storage": {
    "active": "s3",
    "s3": {
      "bucket": "AWS_S3_BUCKET",
      "region": "AWS_S3_REGION"
    }
  }
}
```

### Environment variables

- `AWS_S3_BUCKET`: the bucket of AWS S3
- `AWS_S3_REGION`: region of the AWS S3

Additional environment variables for AWS SDK could be found here
https://docs.aws.amazon.com/sdkref/latest/guide/environment-variables.html