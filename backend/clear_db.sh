#!/usr/bin/env bash
# Clear all data from database tables (keeps schema; leaves django_migrations intact).
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB="${SCRIPT_DIR}/db.sqlite3"

sqlite3 "$DB" <<EOF
PRAGMA foreign_keys = OFF;

DELETE FROM articles_comment;
DELETE FROM articles_article_favored_by;
DELETE FROM articles_article_tag_list;
DELETE FROM articles_article;
DELETE FROM articles_tag;
DELETE FROM users_user_following;
DELETE FROM users_user_groups;
DELETE FROM users_user_user_permissions;
DELETE FROM users_user;
DELETE FROM django_session;
DELETE FROM django_admin_log;
DELETE FROM auth_group_permissions;
DELETE FROM auth_group;

DELETE FROM sqlite_sequence
WHERE name IN (
  'articles_comment', 'articles_article', 'articles_article_tag_list',
  'articles_tag', 'users_user', 'django_admin_log', 'django_session',
  'auth_group'
);

PRAGMA foreign_keys = ON;
VACUUM;
EOF

echo "All database tables cleared."
