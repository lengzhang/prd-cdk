#!/usr/bin/env node
import "source-map-support/register";
import * as dotenv from "dotenv";

import * as cdk from "aws-cdk-lib";

import PrdResourcesStack from "./prd-resources-stack";
import CognitoUserPoolStack from "./cognito-user-pool-stack";
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

  const cognitoUserPoolStackName = `${namePrefix}-cognito-user-pool-stack`;
  const cognitoUserPoolName = `${namePrefix}-cognito-user-pool`;
  const cognitoAppClientName = `${namePrefix}-cognito-app-client`;
  const cognitoUserPoolDomainName = `${namePrefix}-cognito-user-pool-domain`;
  const cognitoDomainPrefix =
    (env.stage === "prod" ? "" : env.stage + "-") + appName;
  new CognitoUserPoolStack(app, cognitoUserPoolStackName, {
    userPoolName: cognitoUserPoolName,
    appClientName: cognitoAppClientName,
    cognitoDomainName: cognitoUserPoolDomainName,
    cognitoDomainPrefix,
  });
}

main();
