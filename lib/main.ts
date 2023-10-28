#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import PrdResourcesStack from "./prd-resources-stack";

const appName = process.env.npm_package_name;
const env: cdk.Environment = {
  account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
};

function main() {
  const app = new cdk.App();
  const namePrefix = `${appName}-${env.account}-${env.region}`;

  const prdResourcesStackName = `${namePrefix}-resources-stack`;
  const prdResourcesBucketName = `${namePrefix}-reports-bucket`;
  new PrdResourcesStack(app, prdResourcesStackName, {
    env,
    reportsBucketName: prdResourcesBucketName,
  });
}

main();
