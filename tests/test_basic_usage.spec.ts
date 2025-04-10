// import { test, expect } from '@playwright/test';

// test('comparaison de deux véhicules', async ({ page }) => {
//   // 1. Accès à la page principale
//   await page.goto('https://vroomiq-efa93.firebaseapp.com/');

//   // 2. Sélection des deux véhicules
//   await page.selectOption('#vehicle1', 'megane3_dci110');
//   await page.selectOption('#vehicle2', 'golf7_tsi150');

//   // 3. Vérifie que le bouton est activé
//   const compareButton = await page.locator('#compareButton');
//   await expect(compareButton).toBeEnabled();

//   // 4. Clic sur le bouton comparer
//   await compareButton.click();

//   // 5. Attend la page de comparaison
//   await expect(page).toHaveURL(/compare.html/);

//   // 6. Vérifie qu’un tableau comparatif est affiché
//   const table = page.locator('.comparison-table');
//   await expect(table).toBeVisible();

//   // 7. Vérifie qu’un critère s’affiche bien (ex : motorisation)
//   const motorisationLabel = page.locator('text=Code moteur');
//   await expect(motorisationLabel).toBeVisible();
// });
