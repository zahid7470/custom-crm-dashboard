import fs from 'fs/promises';
import path from 'path';
import PDFDocument from 'pdfkit';

const PDF_DIR = path.resolve(process.cwd(), 'offers-pdfs');

export async function generateOfferPdf(offer) {
  await fs.mkdir(PDF_DIR, { recursive: true });
  const filePath = path.join(PDF_DIR, `${offer.offerId}.pdf`);

  const doc = new PDFDocument();
  const stream = doc.pipe(await fs.open(filePath, 'w').then((f) => f.createWriteStream()));

  doc.fontSize(24).text('Client Offer', 50, 50);
  doc.fontSize(12).text(`Offer ID: ${offer.offerId}`, 50, 90);
  doc.text(`Offer Date: ${offer.offerDate ? new Date(offer.offerDate).toLocaleDateString() : new Date().toLocaleDateString()}`);
  doc.moveDown();

  doc.fontSize(14).text('Client Information');
  doc.fontSize(12).text(`Name: ${offer.clientName}`);
  if (offer.clientDetails) doc.text(`Details: ${offer.clientDetails}`);
  doc.text(`Client Status: ${offer.clientStatus === 'repeat' ? 'Repeat Client' : 'New Client'}`);
  doc.moveDown();

  doc.fontSize(14).text('Requirement');
  doc.fontSize(12).text(offer.requirement);
  doc.moveDown();

  doc.fontSize(14).text('Service & Scope');
  doc.fontSize(12).text(`Service: ${offer.service}`);
  if (offer.scope) doc.text(`Scope: ${offer.scope}`);
  doc.moveDown();

  doc.fontSize(14).text('Pricing');
  doc.fontSize(12).text(`Amount: ${offer.amount}`);
  doc.moveDown();

  doc.fontSize(14).text('Important Terms');
  doc.fontSize(12).text('Payment terms: 50% advance, 50% on delivery.');
  doc.text('Delivery timeline: To be mutually agreed upon.');
  doc.text('Revision terms: Up to two rounds of reasonable revisions.');
  doc.text('Support terms: 14 days of post-handover support.');
  doc.text('Other conditions: Additional work beyond scope will be quoted separately.');
  doc.moveDown();

  doc.fontSize(10).text('This is a professional offer prepared for the client and does not constitute a legal contract until signed by both parties.', { align: 'center' });

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return filePath;
}
