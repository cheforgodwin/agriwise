export const sendOTP = async (phone, otp, language) => {
  const message =
    language === 'fr'
      ? `Votre code de vérification est: ${otp}. Valide 10 minutes.`
      : `Your verification code is: ${otp}. Valid for 10 minutes.`;

  console.log(`📩 SMS to ${phone}: ${message}`);
  return true;
};
