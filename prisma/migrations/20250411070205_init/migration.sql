-- CreateTable
CREATE TABLE users
(
    id varchar(191) NOT NULL,
    username varchar(191) NOT NULL,
    email varchar(191) NOT NULL,
    password varchar(191) NOT NULL,
    role varchar(191) NOT NULL DEFAULT 'user',
    PRIMARY KEY (id)
);

ALTER TABLE users ADD UNIQUE (username);
ALTER TABLE users ADD UNIQUE (email);

-- CreateTable
CREATE TABLE tree_nodes
(
    id varchar(191) NOT NULL,
    name varchar(191) NOT NULL,
    parentId varchar(191),
    PRIMARY KEY (id)
);

ALTER TABLE tree_nodes ADD INDEX
(parentId);

-- AddForeignKey
ALTER TABLE tree_nodes 
ADD FOREIGN KEY (parentId) 
REFERENCES tree_nodes (id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;
