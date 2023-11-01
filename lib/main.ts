#!/usr/bin/env node
import "source-map-support/register";
import * as dotenv from "dotenv";

import * as cdk from "aws-cdk-lib";

import PrdResourcesStack from "./prd-resources-stack";
import CognitoUserPoolStack from "./cognito-stack";
import { Environment } from "./types";

dotenv.config();

const appName = "prd";
const env: Environment = {
  account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION,
  stage: process.env.STAGE || "",
};

function main() {
  const app = new cdk.App();
  const namePrefix = `${env.stage}-${appName}-${env.account}-${env.region}`;

  const prdResourcesStackName = `${namePrefix}-resources-stack`;
  const prdResourcesBucketName = `${namePrefix}-reports-bucket`;
  new PrdResourcesStack(app, prdResourcesStackName, {
    env,
    reportsBucketName: prdResourcesBucketName,
  });

  const cognitoStackName = `${namePrefix}-cognito-stack`;
  const userPoolName = `${namePrefix}-cognito-user-pool`;
  const userPoolClientName = `${namePrefix}-cognito-user-pool-client`;
  const userPoolDomainName = `${namePrefix}-cognito-user-pool-domain`;
  const userPoolDomainPrefix = `${env.stage}-${appName}-${env.account}`;
  const identityPoolName = `${namePrefix}-cognito-identity-pool`;
  new CognitoUserPoolStack(app, cognitoStackName, {
    env,
    userPoolName,
    userPoolClientName,
    userPoolDomainName,
    userPoolDomainPrefix,
    identityPoolName,
    reportsBucketName: prdResourcesBucketName,
  });
}

main();
