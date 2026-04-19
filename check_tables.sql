SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND (table_name LIKE '%renovation%' OR table_name LIKE '%elevator%' OR table_name LIKE '%request%');
