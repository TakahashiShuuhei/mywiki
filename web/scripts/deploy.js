import * as fs from 'fs';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

// .env.local から環境変数を読み込む
dotenv.config({ path: '.env.local' });

const TEMPLATE_PATH = 'app.yaml.template';
const GENERATED_PATH = 'app.yaml';

// 必要な環境変数のチェック
const requiredEnvVars = ['BASIC_AUTH_USER', 'BASIC_AUTH_PASSWORD'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} is not set in environment variables`);
    process.exit(1);
  }
}

try {
  // テンプレートファイルの読み込み
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  // 環境変数を置換した内容を生成
  const config = template.replace(
    /\${([^}]+)}/g,
    (match, envVar) => process.env[envVar] || match
  );

  // 一時的な app.yaml を生成
  fs.writeFileSync(GENERATED_PATH, config);

  console.log('Generated app.yaml with environment variables');

  // デプロイを実行
  console.log('Deploying to Google App Engine...');
  execSync('gcloud app deploy app.yaml', { stdio: 'inherit' });

  // デプロイ後に一時ファイルを削除
  fs.unlinkSync(GENERATED_PATH);
  console.log('Cleaned up generated app.yaml');

} catch (error) {
  console.error('Deploy failed:', error);
  // エラー時も一時ファイルを削除
  if (fs.existsSync(GENERATED_PATH)) {
    fs.unlinkSync(GENERATED_PATH);
  }
  process.exit(1);
}