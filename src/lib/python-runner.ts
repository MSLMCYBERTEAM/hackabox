import { exec } from 'child_process';
import path from 'path';

export const runPythonScript = (scriptPath: string, args: string[]): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fullPath = path.join(process.cwd(), scriptPath);
    // উইন্ডোজে অনেক সময় 'python' কাজ না করলে 'py' বা 'python3' দিয়ে ট্রাই করুন
    exec(`python ${fullPath} ${args.join(' ')}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Exec Error: ${error}`);
        reject(stderr || "Execution failed");
        return;
      }
      resolve(stdout.trim());
    });
  });
};