-- name for providerData.displayName
ALTER TABLE users
ADD COLUMN name VARCHAR(200) COMMENT '';
-- email for providerData.email
ALTER TABLE users
ADD COLUMN email VARCHAR(200) COMMENT '';
-- fb_uid for providerData.uid
ALTER TABLE users
ADD COLUMN fb_uid VARCHAR(200) COMMENT '';
-- photo_url for providerData.photoURL
ALTER TABLE users
ADD COLUMN photo_url VARCHAR(200) COMMENT '';