const sendEmail = require('./sendEmail');

/**
 * Send an email invoice to the user with CC to app@novaedgedigitallabs.in
 * @param {Object} params
 * @param {Object} params.user - The user object (name, email)
 * @param {String} params.purchaseType - 'subscription' or 'product'
 * @param {Object} params.itemDetails - Name, price, billingCycle (for subscription)
 * @param {Object} params.paymentDetails - orderId, paymentId, date
 */
const sendInvoice = async ({ user, purchaseType, itemDetails, paymentDetails }) => {
    const formattedDate = new Date(paymentDetails.date || Date.now()).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const isSubscription = purchaseType === 'subscription';
    const rawPrice = Number(itemDetails.price || 0);
    const amountInRupees = (rawPrice >= 10000 && rawPrice % 100 === 0) ? (rawPrice / 100) : rawPrice;
    const amountPaid = amountInRupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const cleanName = (itemDetails.name || '').replace(/plan/gi, '').trim();
    const subject = isSubscription
        ? `Invoice Receipt: ${cleanName} Subscription - NovaEdge Digital Labs`
        : `Invoice Receipt: ${itemDetails.name} - NovaEdge Digital Labs`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f3f4f6;
                margin: 0;
                padding: 40px 20px;
                color: #1f2937;
            }
            .invoice-card {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 16px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                overflow: hidden;
                border: 1px solid #e5e7eb;
            }
            .header {
                background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                padding: 32px;
                text-align: center;
                color: #ffffff;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 700;
                letter-spacing: 0.5px;
            }
            .header p {
                margin: 8px 0 0 0;
                font-size: 14px;
                opacity: 0.9;
            }
            .content {
                padding: 32px;
            }
            .greeting {
                font-size: 16px;
                line-height: 1.5;
                margin-bottom: 24px;
            }
            .invoice-table {
                width: 100%;
                border-collapse: collapse;
                margin: 24px 0;
            }
            .invoice-table th {
                background-color: #f9fafb;
                color: #4b5563;
                text-align: left;
                padding: 12px 16px;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                border-bottom: 2px solid #e5e7eb;
            }
            .invoice-table td {
                padding: 16px;
                border-bottom: 1px solid #e5e7eb;
                font-size: 14px;
            }
            .total-row {
                font-weight: bold;
                color: #4f46e5;
                font-size: 16px !important;
            }
            .details-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                background-color: #f9fafb;
                padding: 20px;
                border-radius: 8px;
                margin-top: 24px;
                border: 1px solid #f3f4f6;
            }
            .details-item h4 {
                margin: 0 0 4px 0;
                font-size: 11px;
                text-transform: uppercase;
                color: #6b7280;
                letter-spacing: 0.5px;
            }
            .details-item p {
                margin: 0;
                font-size: 13px;
                font-weight: 600;
                color: #374151;
            }
            .footer {
                text-align: center;
                padding: 24px;
                background-color: #f9fafb;
                border-top: 1px solid #e5e7eb;
                font-size: 12px;
                color: #6b7280;
            }
        </style>
    </head>
    <body>
        <div class="invoice-card">
            <div class="header">
                <img src="cid:logo" alt="NovaEdge Logo" style="width: 48px; height: 48px; border-radius: 12px; margin-bottom: 12px; vertical-align: middle; background-color: #ffffff; padding: 6px; display: inline-block; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" />
                <h1>NovaEdge Digital Labs</h1>
                <p>Payment Invoice & Receipt</p>
            </div>
            <div class="content">
                <p class="greeting">Hello ${user.name},</p>
                <p>Thanks for your purchase. Please find your invoice and transaction details below.</p>
                
                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th>Item Description</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <strong>${itemDetails.name.toUpperCase()}</strong>
                                ${isSubscription ? `<br><span style="font-size: 12px; color: #6b7280;">Billing Cycle: ${itemDetails.billingCycle}</span>` : ''}
                            </td>
                            <td style="text-align: right;">₹${amountPaid}</td>
                        </tr>
                        <tr class="total-row">
                            <td>Total Paid</td>
                            <td style="text-align: right;">₹${amountPaid}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="details-grid" style="margin-top: 24px;">
                    <div class="details-item" style="float: left; width: 45%;">
                        <h4>Payment ID</h4>
                        <p>${paymentDetails.paymentId || 'N/A'}</p>
                    </div>
                    <div class="details-item" style="float: right; width: 45%; text-align: right;">
                        <h4>Order ID</h4>
                        <p>${paymentDetails.orderId || 'N/A'}</p>
                    </div>
                    <div style="clear: both; height: 16px;"></div>
                    <div class="details-item" style="float: left; width: 45%;">
                        <h4>Date</h4>
                        <p>${formattedDate}</p>
                    </div>
                    <div class="details-item" style="float: right; width: 45%; text-align: right;">
                        <h4>Payment Method</h4>
                        <p>Razorpay Online</p>
                    </div>
                    <div style="clear: both;"></div>
                </div>
            </div>
            <div class="footer">
                <p>If you have any questions, please contact support at app@novaedgedigitallabs.in</p>
                <p>&copy; ${new Date().getFullYear()} NovaEdge Digital Labs. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const message = `NovaEdge Digital Labs Invoice\n\nHello ${user.name},\nThanks for your purchase. Here are your transaction details:\n\nItem: ${itemDetails.name}\nTotal: ₹${amountPaid}\nPayment ID: ${paymentDetails.paymentId}\nDate: ${formattedDate}\n\nIf you have any questions, you can reach us at app@novaedgedigitallabs.in`;

    // Send the email with cc to app@novaedgedigitallabs.in and bcc to amitkumarraikwar27@gmail.com
    return await sendEmail({
        email: user.email,
        cc: 'app@novaedgedigitallabs.in',
        bcc: 'amitkumarraikwar27@gmail.com',
        subject,
        message,
        html: htmlContent,
        attachments: [{
            filename: 'logo.png',
            path: '/home/amit/old_data/Development/myProject/novaedge-digital-labs-app/frontend/assets/icon.png',
            cid: 'logo'
        }]
    });
};

module.exports = sendInvoice;
