const languageDetector = (req, res, next) => {
  const langHeader = req.headers['accept-language'] || '';
  let detected = 'en';

  const parts = langHeader.split(',').map((p) => p.trim());

  for (const part of parts) {
    const base = part.split(';')[0].toLowerCase().split('-')[0];
    if (base === 'fr') { detected = 'fr'; break; }
    if (base === 'en') { detected = 'en'; break; }
  }

  req.userLanguage = detected;
  next();
};

export default languageDetector;
