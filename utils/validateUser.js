const validateUser = (user) => {
    const errors = {};
    const { username, email, phonenumber, imageID, password, passwordConfirm, privacyPolicy } = user;
    const emailRegex = /^\S+@\S+\.\S+$/;
    
    if (!username) errors.username = "Käyttäjätunnus puuttu";
    else if (username.length > 32) errors.username = "Käyttäjätunnus on liian pitkä";

    if (!email || email.length < 5) errors.email = "Sähköposti puuttuu tai on liian lyhyt";
    else if (!emailRegex.test(email)) errors.email = "Sähköpostiosoite ei ole kelvollinen";
    else if (email.length > 50) errors.email = "Sähköposti on liian pitkä";
    
    if (!phonenumber || phonenumber.length < 10) errors.phonenumber = "Puhelinnumerossa on oltava vähintään 10 merkkiä";
    else if (phonenumber.length > 32) errors.phonenumber = "Puhelinnumero on liian pitkä";
    
    if (!imageID || parseInt(imageID) < 1) errors.imageID = "Ole hyvä ja valitse profiilikuva";
    
    if (!password || password.length < 8) errors.password = "Salasanassa on oltava vähintään 8 merkkiä";
    else if (password.length > 32) errors.password = "Salasana on liian pitkä";
    
    if (password !== passwordConfirm) errors.passwordConfirm = "Salasanat eivät täsmää";
    
    if (privacyPolicy !== true) errors.privacyPolicy = "Hyväksy tietosuojaseloste";
  
    return errors;
  };
  
  export default validateUser;