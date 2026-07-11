const { setGlobalOptions } = require("firebase-functions/v2");
const { onRequest } = require("firebase-functions/v2/https");
const cors = require("cors")({ origin: true });

setGlobalOptions({ maxInstances: 10 });

exports.checkSpeaking = onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      const { transcript } = req.body;

      if (!transcript) {
        return res.status(400).json({
          error: "Transcript required",
        });
      }

      const words = transcript.trim().split(/\s+/);
      const wordCount = words.length;

      let level = "A1";

      if (wordCount > 20) level = "A2";
      if (wordCount > 40) level = "B1";
      if (wordCount > 70) level = "B2";
      if (wordCount > 120) level = "C1";

      return res.json({
        level,
        wordCount,
        transcript,
        feedback: `Estimated speaking level: ${level}`,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: err.message,
      });
    }
  });
});