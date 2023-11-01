import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

import { Environment } from "./types";

interface PrdResourcesStackProps extends cdk.StackProps {
  env: Environment;
  reportsBucketName: string;
}

class PrdResourcesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PrdResourcesStackProps) {
    super(scope, id, props);
    this.createPrdReportsBucket(props.reportsBucketName, props.env);
  }

  createPrdReportsBucket(reportsBucketName: string, env: Environment) {
    const cors: s3.CorsRule[] = [];
    const corsRule: s3.CorsRule = {
      allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
      allowedOrigins: [],
      allowedHeaders: ["*"],
    };
    if (env.stage === "prod" && process.env.ORIGIN) {
      corsRule.allowedOrigins.push(process.env.ORIGIN);
      cors.push(corsRule);
    } else if (env.stage === "dev") {
      corsRule.allowedOrigins.push("*");
      cors.push(corsRule);
    }

    new s3.Bucket(this, reportsBucketName, {
      bucketName: reportsBucketName,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors,
    });
  }
}

export default PrdResourcesStack;
