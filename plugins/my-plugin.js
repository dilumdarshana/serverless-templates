/**
 * Example custom Serverless Framework plugin.
 *
 * What it does:
 *   - Adds a custom CLI command: `serverless testDeploymentBucket`
 *   - Hooks into `before:package:initialize` so that whenever a package/deploy
 *     starts, it verifies the deployment bucket exists and applies the
 *     versioning / encryption / tags configuration defined under
 *     `custom.deploymentBucket` in serverless.yml.
 *
 * This demonstrates the three core plugin concepts:
 *   1. `commands`  - custom CLI commands and their lifecycle events
 *   2. `hooks`     - run custom logic around framework lifecycle events
 *   3. `provider`  - call AWS APIs through the provider abstraction
 */
class MyPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    // Access AWS APIs through the provider instead of instantiating the SDK
    this.provider = this.serverless.getProvider('aws');

    this.bucketParams = {};

    this.commands = {
      testDeploymentBucket: {
        usage: 'Verify / configure the deployment bucket',
        lifecycleEvents: ['create'],
      },
    };

    this.hooks = {
      'before:package:initialize': this.createDeploymentBucket.bind(this),
      'testDeploymentBucket:create': this.createDeploymentBucket.bind(this),
    };
  }

  /**
   * Resolve the deployment bucket name from provider config.
   * Supports both `deploymentBucket: <name>` and `deploymentBucket: { name: ... }`.
   */
  getBucketName() {
    const bucket = this.serverless.service.provider.deploymentBucket;
    if (typeof bucket === 'string') return bucket;
    return bucket && bucket.name ? bucket.name : '';
  }

  async bucketExists() {
    try {
      await this.provider.request('S3', 'headBucket', this.bucketParams);
      return true;
    } catch (e) {
      if (e.code !== 'AWS_S3_HEAD_BUCKET_NOT_FOUND') {
        throw e;
      }
      return false;
    }
  }

  async createBucket() {
    await this.provider.request('S3', 'createBucket', {
      ...this.bucketParams,
      ACL: 'private',
    });
    this.serverless.cli.log(`Deployment bucket '${this.bucketParams.Bucket}' created.`);
  }

  async bucketVersioningEnabled() {
    try {
      const res = await this.provider.request('S3', 'getBucketVersioning', this.bucketParams);
      return !!(res.Status && res.Status === 'Enabled');
    } catch (e) {
      return false;
    }
  }

  async createBucketVersioning() {
    await this.provider.request('S3', 'putBucketVersioning', {
      ...this.bucketParams,
      VersioningConfiguration: { Status: 'Enabled' },
    });
    this.serverless.cli.log(`Deployment bucket '${this.bucketParams.Bucket}' versioning enabled.`);
  }

  async bucketTagsChanged(tags) {
    try {
      const res = await this.provider.request('S3', 'getBucketTagging', this.bucketParams);
      return JSON.stringify(res.TagSet) !== JSON.stringify(tags);
    } catch (e) {
      // bucket is not tagged yet
      return true;
    }
  }

  async updateBucketTags(tags) {
    if (tags.length) {
      await this.provider.request('S3', 'putBucketTagging', {
        ...this.bucketParams,
        Tagging: { TagSet: tags },
      });
      this.serverless.cli.log(`Tags applied: ${tags.map((elm) => elm.Key).join(', ')}`);
    } else {
      await this.provider.request('S3', 'deleteBucketTagging', this.bucketParams);
      this.serverless.cli.log('All tags removed.');
    }
  }

  async createDeploymentBucket() {
    const bucketName = this.getBucketName();
    const bucketProperties = this.serverless.service.custom.deploymentBucket || {};
    const { versioning = false, tags = [] } = bucketProperties;

    // Skip AWS calls during local development
    if (this.serverless.service.provider.stage === 'local') {
      this.serverless.cli.log('Skipping deployment bucket management for local stage.');
      return;
    }

    if (!bucketName) {
      this.serverless.cli.log('No deployment bucket configured.');
      return;
    }

    this.bucketParams = { Bucket: bucketName };

    try {
      if (await this.bucketExists()) {
        this.serverless.cli.log(`Deployment bucket '${bucketName}' already exists.`);
      } else {
        await this.createBucket();
      }

      if (versioning && !(await this.bucketVersioningEnabled())) {
        await this.createBucketVersioning();
      }

      if (await this.bucketTagsChanged(tags)) {
        await this.updateBucketTags(tags);
      }
    } catch (error) {
      this.serverless.cli.log(`Error managing deployment bucket: ${error.message}`);
      throw error;
    }
  }
}

module.exports = MyPlugin;
