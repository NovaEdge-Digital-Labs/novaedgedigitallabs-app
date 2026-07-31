const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        // Create a transporter using Gmail SMTP
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Define the email options
        const mailOptions = {
            from: `${process.env.COMPANY_NAME || 'NovaEdge Digital Labs'} <${process.env.EMAIL_USER}>`,
            to: options.email,
            cc: options.cc !== undefined ? options.cc : 'app@novaedgedigitallabs.in',
            bcc: options.bcc !== undefined ? options.bcc : 'amitkumarraikwar27@gmail.com',
            subject: options.subject,
            text: options.message,
            html: options.html, // Optional HTML version
            attachments: options.attachments // Optional attachments (e.g. inline images)
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = sendEmail;
