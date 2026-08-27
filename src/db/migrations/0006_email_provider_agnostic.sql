-- Hand-authored: email_log.sendgrid_message_id was named while SendGrid was the assumed
-- provider. Now that Resend is the actual provider, rename it so the column doesn't lie about
-- what's stored in it.
alter table public.email_log rename column sendgrid_message_id to provider_message_id;
