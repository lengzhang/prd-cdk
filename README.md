# Property Report Dashboard (PRD) CDK

This is a CDK project for AWS resources and services deployment.

## AWS CDK

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Development

1. Set environment variables
    ```bash
    touch .env
    echo STAGE=dev >> .env
    ```
2. Modify code
3. Build CDk by `npm run build`
4. Deploy dev CDK stacks to AWS: `npm run deploy`
5. Destroy all dev CDK stacks from AWS: `npm run destroy`

## Scripts

- `npm run build`   compile typescript to js, perform the jest unit tests, and then list all CDK stacks
- `npm run watch`   watch for changes and compile
- `npm run test`    perform the jest unit tests
- `npm run clean`   remove all compiled files and cdk templates
- `npm run deploy`  deploy all stacks without approval prompts
- `npm run destroy` destroy all stacks

## Deployment commands
- `cdk diff`                compare deployed stack with current state
- `cdk synth`               emits the synthesized CloudFormation template
- `cdk deploy`   deploy stacks to your default AWS account/region