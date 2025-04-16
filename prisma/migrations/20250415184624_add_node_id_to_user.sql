-- First, update existing data to match new enum values
UPDATE User SET role = 'USER' WHERE role = 'User';
UPDATE User SET role = 'ADMIN' WHERE role = 'Admin';

UPDATE TreeNode SET category = 'ROOT' WHERE category = 'root';
UPDATE TreeNode SET category = 'KUNDE' WHERE category = 'kunde';
UPDATE TreeNode SET category = 'STANDORT' WHERE category = 'standort';
UPDATE TreeNode SET category = 'BEREICH' WHERE category = 'bereich';

-- Then modify the tables
ALTER TABLE User 
    DROP COLUMN username
,
ADD COLUMN emailVerified DATETIME
(3) NULL,
ADD COLUMN image VARCHAR
(191) NULL,
ADD COLUMN nodeId VARCHAR
(191) NULL,
    MODIFY COLUMN role ENUM
('USER', 'ADMIN') NOT NULL DEFAULT 'USER';

ALTER TABLE TreeNode 
    MODIFY COLUMN category VARCHAR
(191) NOT NULL;

-- Finally, add the foreign key constraint
ALTER TABLE User 
    ADD CONSTRAINT User_nodeId_fkey 
    FOREIGN KEY (nodeId) 
    REFERENCES TreeNode(id) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE; 