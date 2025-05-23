import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false // For development only
        }
      });

      console.log('Email transporter initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
  }

  async sendEmail(to, subject, htmlContent, textContent = '') {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const mailOptions = {
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to,
        subject,
        html: htmlContent,
        text: textContent || this.stripHtml(htmlContent)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Failed to send email:', error);
      return { success: false, error: error.message };
    }
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }

  generateTemporaryPassword() {
    // Generate a secure temporary password
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let password = '';
    
    // Ensure at least one of each type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
    password += '!@#$%&*'[Math.floor(Math.random() * 7)]; // Special char
    
    // Fill the rest randomly
    for (let i = 4; i < 12; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  async sendTemporaryPassword(email, name, surname, temporaryPassword) {
    const subject = 'Votre compte technicien IT13 a été approuvé - Mot de passe temporaire';
    
    // Generate secure token for password change (24 hours validity)
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
    
    const changePasswordToken = jwt.sign(
      { 
        email: email,
        type: 'temporary_password',
        timestamp: Date.now()
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    const changePasswordUrl = `${process.env.FRONTEND_URL}/change-password?token=${changePasswordToken}&temporary=true`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Compte Technicien Approuvé</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #06b6d4;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #06b6d4;
            margin-bottom: 10px;
          }
          .welcome {
            color: #059669;
            font-size: 24px;
            margin-bottom: 20px;
          }
          .password-box {
            background: #f1f5f9;
            border: 2px solid #06b6d4;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
          }
          .password {
            font-family: 'Courier New', monospace;
            font-size: 18px;
            font-weight: bold;
            color: #dc2626;
            letter-spacing: 2px;
            background: white;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #e5e7eb;
          }
          .warning {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
          }
          .warning-icon {
            color: #f59e0b;
            font-weight: bold;
          }
          .requirements {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
          }
          .requirements h4 {
            color: #0ea5e9;
            margin-top: 0;
          }
          .requirements ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          .requirements li {
            margin: 5px 0;
          }
          .button {
            display: inline-block;
            background: #06b6d4;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .button-secondary {
            display: inline-block;
            background: #059669;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 10px 5px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">IT13</div>
            <div>Plateforme de Services Informatiques</div>
          </div>
          
          <h2 class="welcome">🎉 Félicitations ${name} ${surname} !</h2>
          
          <p>Votre candidature pour devenir technicien IT13 a été <strong>approuvée</strong> par notre équipe administrative.</p>
          
          <p>Vous pouvez maintenant accéder à votre espace technicien avec les informations suivantes :</p>
          
          <div style="margin: 20px 0;">
            <strong>Email :</strong> ${email}<br>
            <strong>Mot de passe temporaire :</strong>
          </div>
          
          <div class="password-box">
            <div style="margin-bottom: 10px; color: #374151;">Votre mot de passe temporaire :</div>
            <div class="password">${temporaryPassword}</div>
          </div>
          
          <div class="warning">
            <div class="warning-icon">⚠️ IMPORTANT :</div>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Ce mot de passe est <strong>temporaire</strong> et doit être changé lors de votre première connexion</li>
              <li>Pour des raisons de sécurité, ne partagez jamais ce mot de passe</li>
              <li>Ce mot de passe expire dans <strong>24 heures</strong></li>
              <li>Utilisez le lien sécurisé ci-dessous pour changer votre mot de passe</li>
            </ul>
          </div>
          
          <div class="requirements">
            <h4>📋 Exigences pour votre nouveau mot de passe :</h4>
            <ul>
              <li>Au moins 8 caractères</li>
              <li>Au moins une lettre majuscule (A-Z)</li>
              <li>Au moins une lettre minuscule (a-z)</li>
              <li>Au moins un chiffre (0-9)</li>
              <li>Au moins un caractère spécial (!@#$%^&*)</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/techlog" class="button">
              Se connecter avec le mot de passe temporaire
            </a>
            <br>
            <a href="${changePasswordUrl}" class="button-secondary">
              Changer directement le mot de passe
            </a>
          </div>
          
          <p><strong>Deux options s'offrent à vous :</strong></p>
          <ol>
            <li><strong>Connexion puis changement :</strong> Connectez-vous avec le mot de passe temporaire, vous serez automatiquement redirigé pour le changer</li>
            <li><strong>Changement direct :</strong> Utilisez le lien "Changer directement le mot de passe" pour définir votre nouveau mot de passe sans vous connecter d'abord</li>
          </ol>
          
          <p>Une fois votre mot de passe défini, vous pourrez :</p>
          <ul>
            <li>Consulter vos tâches assignées</li>
            <li>Gérer votre calendrier d'interventions</li>
            <li>Accéder aux outils de gestion d'inventaire</li>
            <li>Mettre à jour votre profil professionnel</li>
          </ul>
          
          <div class="footer">
            <p>Si vous rencontrez des difficultés, contactez notre support technique :</p>
            <p><strong>Email :</strong> support@it13.com | <strong>Téléphone :</strong> +33 1 23 45 67 89</p>
            <p style="margin-top: 15px;">
              © 2024 IT13 - Plateforme de Services Informatiques<br>
              Cet email a été envoyé automatiquement, merci de ne pas y répondre.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await this.sendEmail(email, subject, htmlContent);
    
    // Return both email result and the token for potential use
    return {
      ...result,
      changePasswordToken: changePasswordToken
    };
  }

  async sendApplicationRejection(email, name, surname, rejectionReason) {
    const subject = 'Mise à jour de votre candidature technicien IT13';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Candidature Technicien</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #06b6d4;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #06b6d4;
            margin-bottom: 10px;
          }
          .rejection-box {
            background: #fef2f2;
            border: 1px solid #fca5a5;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">IT13</div>
            <div>Plateforme de Services Informatiques</div>
          </div>
          
          <h2>Candidature Technicien</h2>
          
          <p>Bonjour ${name} ${surname},</p>
          
          <p>Nous vous remercions pour l'intérêt que vous portez à IT13 et pour le temps consacré à votre candidature.</p>
          
          <div class="rejection-box">
            <h4 style="color: #dc2626; margin-top: 0;">Décision concernant votre candidature</h4>
            <p>Après examen attentif de votre dossier, nous regrettons de vous informer que nous ne pouvons pas donner suite favorable à votre candidature pour le moment.</p>
            
            ${rejectionReason ? `
              <h5>Motif :</h5>
              <p style="font-style: italic;">${rejectionReason}</p>
            ` : ''}
          </div>
          
          <p>Cette décision ne remet pas en question vos compétences professionnelles. Nous vous encourageons à postuler de nouveau dans le futur, notamment si vous acquérez de nouvelles qualifications ou expériences.</p>
          
          <p>Nous vous souhaitons beaucoup de succès dans vos projets professionnels.</p>
          
          <div class="footer">
            <p>Cordialement,<br>L'équipe IT13</p>
            <p style="margin-top: 15px;">
              © 2024 IT13 - Plateforme de Services Informatiques<br>
              Cet email a été envoyé automatiquement, merci de ne pas y répondre.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(email, subject, htmlContent);
  }

  async sendPasswordResetEmail(email, name, resetToken) {
    const subject = 'Réinitialisation de votre mot de passe IT13';
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Réinitialisation Mot de Passe</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .button {
            display: inline-block;
            background: #06b6d4;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Réinitialisation de mot de passe</h2>
          <p>Bonjour ${name},</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe IT13.</p>
          <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
          </div>
          <p><strong>Ce lien expire dans 1 heure.</strong></p>
          <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(email, subject, htmlContent);
  }
}

export default new EmailService(); 