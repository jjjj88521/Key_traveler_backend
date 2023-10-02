-- uid為使用者id變數，會員登入後可以得到，需要代入查詢
SET @uid = 1;
--
-- TEST
SELECT p.*,
    f.id AS favorite_id
FROM products AS p
    LEFT JOIN favorites AS f ON f.pid = p.id
    AND f.uid = @uid
ORDER BY p.id ASC;
--
-- TEST
SELECT p.*, IF(f.id, 'true', 'false') AS is_favorite
    FROM products AS p
    LEFT JOIN favorites AS f ON f.pid = p.id
    AND f.uid = @uid
    ORDER BY p.id ASC;
--
-- 只有會員有加入到我的最愛的商品清單
SELECT p.*
FROM product AS p
    INNER JOIN favorites AS f ON f.pid = p.id
    AND f.uid = @uid
ORDER BY p.id ASC;
--
-- uid為使用者id變數，會員登入後可以得到，需要代入查詢
SET @uid = 1;
SET @pid = 5;
-- 
INSERT INTO favorites (uid, pid)
VALUES (@uid, @pid)

--
-- uid為使用者id變數，會員登入後可以得到，需要代入查詢
SET @uid = 1;
SET @pid = 5;
DELETE FROM favorites
WHERE pid=@pid AND uid=@uid;

--
-- uid為使用者id變數，會員登入後可以得到，需要代入查詢
SET @uid = 1;
SELECT f.pid
FROM favorites AS f
    WHERE f.uid = @uid
ORDER BY f.pid ASC;