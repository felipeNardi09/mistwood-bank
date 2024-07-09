import { readFile } from 'fs/promises';
import Handlebars from 'handlebars';
import { Resend } from 'resend';

interface User {
  email: string;
  name: string;
}

const resend = new Resend(process.env.RESEND_API_KEY);

export class Email {
  to: string;
  name: string;
  from: string;

  constructor(user: User) {
    this.to = user.email;
    this.name = user.name;
    this.from = `${process.env.EMAIL_FROM} <${process.env.EMAIL_TEST}>`;
  }

  async sendEmail(template: 'welcome', subject: string) {
    const htmlTemplate = await readFile(
      `${__dirname}/../views/email/${template}.html`
    );

    const html = Handlebars.compile(htmlTemplate.toString());

    const { error } = await resend.emails.send({
      from: this.from,
      to: [this.to],
      subject,
      html: html({ name: this.name })
    });

    if (error) {
      return error;
    }
  }
}
