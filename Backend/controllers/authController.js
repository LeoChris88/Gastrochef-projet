const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    console.log('Données reçues:', req.body);
    
    const { username, restaurantName, email, password } = req.body;
    const finalUsername = username || restaurantName;

    console.log('Variables extraites:', { finalUsername, email, password });

    if (!finalUsername || !email || !password) {
      console.log('Validation échouée');
      return res.status(400).json({ 
        message: "Tous les champs sont requis",
        received: req.body
      });
    }

    console.log('Validation OK, recherche utilisateur existant...');
    
    let user = await User.findOne({ email });
    
    console.log('Résultat recherche:', user ? 'Utilisateur existe déjà' : 'Nouvel utilisateur');
    
    if (user) {
      console.log('Utilisateur déjà existant');
      return res.status(400).json({ message: "Cet utilisateur existe déjà" });
    }

    console.log('Hash du mot de passe...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('Création de l\'utilisateur...');
    user = new User({
      username: finalUsername,
      email,
      password: hashedPassword
    }); 

    console.log('Sauvegarde en base...');
    await user.save();

    console.log('Génération du token...');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    console.log('Inscription réussie !');
    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        username: user.username,
        email: user.email
      } 
    });
  } catch (error) {
    console.error('ERREUR COMPLÈTE:', error);
    res.status(500).json({ 
      message: "Erreur serveur lors de l'inscription",
      error: error.message 
    });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('Login - Données reçues:', req.body);
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email et mot de passe requis" 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la connexion',
      error: error.message 
    });
  }
};