import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const connection_type = [
  "shared_connection",
  "dedicated_connection",
] as const;

export const emailTemplate = (
  user: { name: string },
  code: string
) => `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }

        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .header {
            background-color: #0066cc;
            color: #ffffff;
            padding: 20px;
            text-align: center;
        }

        .header h1 {
            margin: 0;
            font-size: 24px;
        }

        .content {
            padding: 20px;
        }

        .content p {
            font-size: 16px;
            color: #333333;
            line-height: 1.6;
        }

        .code-box {
            background-color: #f1f1f1;
            padding: 15px;
            margin: 20px 0;
            border-left: 4px solid #0066cc;
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            letter-spacing: 2px;
            color: #0066cc;
        }

        .footer {
            text-align: center;
            padding: 20px;
            background-color: #f4f4f4;
            color: #777777;
            font-size: 14px;
        }

        .footer p {
            margin: 0;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to the MQTT Broker Platform</h1>
        </div>
        <div class="content">
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>Thank you for registering at the MQTT Broker Platform.</p>
            <p>Please use the following code to verify your email address:</p>
            <div class="code-box">
                ${code}
            </div>
            <p>Log in to your account and enter this code to complete the verification process.</p>
        </div>
        <div class="footer">
            <p>If you did not request this, please ignore this email.</p>
            <p>&copy; 2024 MQTT Broker Platform</p>
        </div>
    </div>
</body>

</html> 
        `;
