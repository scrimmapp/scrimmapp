-- Hand-authored: lets a coach delete their own pitch-side comment. No update policy is added
-- alongside it: comments stay post-or-remove, never silently rewritten after the fact.
create policy "comments_delete_own" on public.comments for delete
  to authenticated using (author_id = auth.uid());
