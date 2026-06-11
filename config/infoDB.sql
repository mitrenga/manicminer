SELECT `ndx`, `name`, `score`, `created`
FROM `rg_mm_hallOfFame`
ORDER BY `ndx` DESC
LIMIT :limit
