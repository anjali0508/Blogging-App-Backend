let conn = require("../app/models/connection");

// USERS TABLE
let create_user_table = `
    CREATE TABLE IF NOT EXISTS users(
        user_id INT PRIMARY KEY AUTO_INCREMENT,
        email  VARCHAR(255) NOT NULL UNIQUE,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        about VARCHAR(2048),
        profile_image_url VARCHAR(2048),
        FULLTEXT(username, about)
    )
`;

conn.query(create_user_table, (err, result) => {
  if (err) throw err;
  console.log("users table created");
});

// FOLLOWERS TABLE
// Add primary key and not null
let create_followers_table = `
    CREATE TABLE IF NOT EXISTS followers(
        user_id INT,
        follower_id INT,
        PRIMARY KEY(user_id, follower_id),
        FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY(follower_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
    )
`;

conn.query(create_followers_table, (err, result) => {
  if (err) throw err;
  console.log("followers table created");
});

// COLLECTIONS TABLE
let create_collections_table = `
    CREATE TABLE IF NOT EXISTS collections(
        collection_id VARCHAR(255) PRIMARY KEY,
        collection_name VARCHAR(255) NOT NULL,
        user_id INT,
        image_url VARCHAR(2048),
        description VARCHAR(2048),
        tags VARCHAR(1024),
        FULLTEXT(collection_name, tags),
        FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
    )
`;

conn.query(create_collections_table, (err, result) => {
  if (err) throw err;
  console.log("collections table created");
});

// USERS_COLLECTIONS TABLE
// make user_id and collection_id unique together
let create_collection_followers_table = `
    CREATE TABLE IF NOT EXISTS collection_followers(
        user_id INT,
        collection_id VARCHAR(255),
        PRIMARY KEY(user_id, collection_id),
        FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY(collection_id) REFERENCES collections(collection_id) ON DELETE CASCADE ON UPDATE CASCADE
    )
`;

conn.query(create_collection_followers_table, (err, result) => {
  if (err) throw err;
  console.log("users_collections table created");
});

// COLLECTION_AUTHORS
let create_collection_authors_table = `
    CREATE TABLE IF NOT EXISTS collection_authors(
      collection_id VARCHAR(255),
      author_id INT,
      PRIMARY KEY(collection_id, author_id),
      FOREIGN KEY(author_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY(collection_id) REFERENCES collections(collection_id) ON DELETE CASCADE ON UPDATE CASCADE
    )
`;

conn.query(create_collection_authors_table, (err, result) => {
  if (err) throw err;
  console.log("collections_authors table created");
});

// ARTICLES TABLE
let create_articles_table = `
    CREATE TABLE IF NOT EXISTS articles(
        article_id VARCHAR(255) PRIMARY KEY,
        collection_id VARCHAR(255),
        user_id INT,
        title VARCHAR(255) NOT NULL,
        content LONGTEXT,
        published BOOLEAN,
        image_path VARCHAR(2048),
        views_count INT,
        kudos_count INT,
        date_created DATE,
        date_updated DATE,
        tags VARCHAR(1024),
        FULLTEXT(title, tags),
        FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY(collection_id) REFERENCES collections(collection_id) ON DELETE CASCADE ON UPDATE CASCADE
    )
`;

conn.query(create_articles_table, (err, result) => {
  if (err) throw err;
  console.log("articles table created");
});

// ARTICLE_BOOKMARKS TABLE
let create_article_bookmarks_table = `
    CREATE TABLE IF NOT EXISTS article_bookmarks(
        article_id VARCHAR(255) NOT NULL,
        user_id INT NOT NULL,
        PRIMARY KEY(article_id, user_id),
        FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY(article_id) REFERENCES articles(article_id) ON DELETE CASCADE ON UPDATE CASCADE
    )
`;
conn.query(create_article_bookmarks_table, (err, result) => {
  if (err) throw err;
  console.log("article_bookmarks table created");
});

// COMMENTS TABLE
let create_comments_table = `
    CREATE TABLE IF NOT EXISTS comments(
        comment_id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        content TEXT,
        date_created DATE,
        date_updated DATE,
        FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
    )
`;

conn.query(create_comments_table, (err, result) => {
  if (err) throw err;
  console.log("comments table created");
});

// ARTICLE_COMMENTS TABLE
let create_articles_comments_table = `
    CREATE TABLE IF NOT EXISTS articles_comments(
        id INT PRIMARY KEY AUTO_INCREMENT,
        comment_id INT,
        article_id VARCHAR(255),
        FOREIGN KEY(article_id) REFERENCES articles(article_id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY(comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE ON UPDATE CASCADE
    )
`;

conn.query(create_articles_comments_table, (err, result) => {
  if (err) throw err;
  console.log("artilce_comments table created");
});

// REPLY_COMMENTS TABLE
let create_reply_comments_table = `
    CREATE TABLE IF NOT EXISTS articles_comments(
        id INT PRIMARY KEY AUTO_INCREMENT,
        comment_id INT,
        reply_id VARCHAR(255),
        FOREIGN KEY(comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY(reply_id) REFERENCES comments(reply_id) ON DELETE CASCADE ON UPDATE CASCADE
    )
`;

conn.query(create_reply_comments_table, (err, result) => {
  if (err) throw err;
  console.log("reply_comments table created");
});
