import * as cdk from "aws-cdk-lib";

export interface Environment extends cdk.Environment {
  stage: string;
}
