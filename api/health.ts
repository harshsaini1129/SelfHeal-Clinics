export default function handler(_req: any, res: any) {
  const apiKeyConfigured = Boolean(process.env.GEMINI_API_KEY);

  res.status(200).json({
    status: "ok",
    apiKeyConfigured,
    chatEnabled: apiKeyConfigured,
  });
}
