---
layout: post
title: "HowTo: Log DDL events in your Oracle database"
date: 2008-02-12 13:48:00 +0200
category: software-craftsmanship
tags: howto database oracle version-control
---

**Update (30/10/2008)**: trigger code updated, due to a bug pointed out by Michel in the comments.

Databases [should be under version control](http://www.codinghorror.com/blog/archives/001050.html). Not only that, but I believe that SQL scripts should be treated as regular code: [can your database be built in one step](http://www.joelonsoftware.com/articles/fog0000000043.html)?

But if you do that, you will want to [scripts database changes](http://odetocode.com/Blogs/scott/archive/2008/02/02/11721.aspx) too. This seems quite easy to do if you manage the whole application, but far less so if your it falls under the responsibility of, say, your customer DBA. But in any case, I think it is a good idea to track all the changes made on the structure of your database. So here is some simple scripts that I use on a daily basis to achieve this.

First of all, create a table:
```sql
CREATE TABLE log$ddlevents
(
    EventDate DATE DEFAULT SYSDATE NOT NULL,
    Owner VARCHAR2(30),
    EventType VARCHAR2(30) NOT NULL,
    ObjectType VARCHAR2(18) NOT NULL,
    ObjectName VARCHAR2(128),
    DatabaseUser VARCHAR2(30) NOT NULL,
    OsUser VARCHAR2(30),
    MachineName VARCHAR2(64),
    ProgramName VARCHAR2(64),
    SqlText VARCHAR2(4000)
);
```
This table can be automatically filled thanks to the appropriate trigger:
```sql
CREATE OR REPLACE TRIGGER trg_ad_logddlevent
    AFTER ALTER OR CREATE OR DROP OR RENAME ON SCHEMA
DECLARE
    sqlTextPart ora_name_list_t;
    sqlText VARCHAR2(4000);
    i PLS_INTEGER;
BEGIN
    FOR i IN 1 .. ora_sql_txt(sqlTextPart)
    LOOP
        -- Make sure that we only retrieve the first 4000 characters
        DECLARE
            l PLS_INTEGER; -- Length of the current string
            l1 PLS_INTEGER; -- Length of the concatenated string (can be >=4000)
            lp PLS_INTEGER; -- Length to be concatenated
        BEGIN
            SELECT NVL2(sqlText, LENGTH(sqlText), 0)
                INTO l
                FROM DUAL;
            SELECT l+NVL2(sqlTextPart(i), LENGTH(sqlTextPart(i)), 0)
                INTO l1
                FROM DUAL;
            SELECT DECODE(SIGN(l1-4000), -1, l1, 4000-l)
                INTO lp
                FROM DUAL;
            sqlText:=CONCAT(sqlText, SUBSTR(sqlTextPart(i), 1, lp));

            IF (l1>=4000)
            THEN
                EXIT;
            END IF;
        END;
    END LOOP;

    INSERT INTO log$ddlevents (
        Owner,
        EventType,
        ObjectType,
        ObjectName,
        DatabaseUser,
        OsUser,
        MachineName,
        ProgramName,
        SqlText
    ) VALUES (
        ora_dict_obj_owner,
        ora_sysevent,
        ora_dict_obj_type,
        ora_dict_obj_name,
        ora_login_user,
        SYS_CONTEXT('USERENV', 'OS_USER'),
        SYS_CONTEXT('USERENV', 'HOST'),
        SYS_CONTEXT('USERENV', 'MODULE'),
        sqlText
    );
END;
```
