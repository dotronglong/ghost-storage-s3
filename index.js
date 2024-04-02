const StorageBase = require('ghost-storage-base');
const {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  S3Client
} = require("@aws-sdk/client-s3");
const {
  readFileSync
} = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const debug = require('debug')('ghost:s3');

class StorageS3 extends StorageBase {
  constructor(config) {
    config = config || {};
    super(config);

    this.bucket = config.bucket || process.env.AWS_S3_BUCKET;
    this.region = config.region || process.env.AWS_S3_REGION || "ap-southeast-1";
    this.acl = config.acl || process.env.AWS_S3_ACL || "public-read";
    this.client = new S3Client({});
  }

  async exists(filename) {    
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: filename,
    });

    try {
      await client.send(command);
      return true
    } catch (e) {
      return false
    }
  }

  async save(file, targetDir) {
    debug('save', file.name)
    targetDir = targetDir || this.getTargetDir();
    const filename = await this.getUniqueFileName(file, targetDir);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: filename,
      Body: readFileSync(file.path),
      ACL: this.acl
    });

    try {
      await this.client.send(command);
      return this.getUniqueFileUrl(filename);
    } catch (e) {
      throw e;
    }
  }

  serve() {
    return async (req, res, next) => {
      debug('serve', req.path)
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: req.path,
      });

      try {
        const response = await this.client.send(command);
        const buf = await response.Body.transformToByteArray();
        res.send(Buffer.from(buf))
        next();
      } catch (e) {
        if (e.name === "NoSuchKey") {
          res.status(404);
          next();
        } else {
          next(e);
        }
      }
    }
  }

  delete(filename) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: filename,
    });

    return this.client.send(command)
  }

  read() {
    debug('read')
  }

  getUniqueFileName(file, targetDir) {
    const parsedName = path.parse(file.name)
    return path.join(targetDir, `${uuidv4()}${parsedName.ext}`)
  }

  getUniqueFileUrl(filename) {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${filename}`
  }
}

module.exports = StorageS3;