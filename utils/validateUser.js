const validateUser = (user) => {
    const { username, email, phonenumber, imageID, password } = user;
    const emailRegex = /^\S+@\S+\.\S+$/;
    
    if (!username) return "Ole hyvä ja kirjoita käyttäjätunnuksesi";
    if (username.length > 32) return "Käyttäjätunnus on liian pitkä";
    if (!email || email.length < 5) return "Sähköposti puuttuu tai on liian lyhyt";
    if (!emailRegex.test(email)) return "Sähköpostiosoite ei ole kelvollinen";
    if (email.length > 50) return "Sähköposti on liian pitkä";
    if (!phonenumber || phonenumber.length < 10) return "Puhelinnumerossa on oltava vähintään 10 merkkiä";
    if (phonenumber.length > 32) return "Puhelinnumero on liian pitkä";
    if (!imageID || parseInt(imageID) < 1) return "Ole hyvä ja valitse profiilikuva";
    if (!password || password.length < 8) return "Salasanassa on oltava vähintään 8 merkkiä";
    if (password.length > 32) return "Salasana on liian pitkä";
  
    return null;
  };
  
  export default validateUser;