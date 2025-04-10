import { test, expect } from '@playwright/test';

test('Créer et supprimer un véhicule dans Firebase', async ({ page }) => {
  const vehicleId = `playwright-${Date.now()}`; // ID unique
  const baseUrl = 'https://vroomiq-efa93.firebaseapp.com/admin.html';

  await page.goto(baseUrl);
  await page.click('#toggleFormBtn');

  // Remplir quelques champs obligatoires
  await page.fill('#vehicle-id-input', vehicleId);
  await page.fill('#vehicle-brand', 'PlayAuto');
  await page.fill('#vehicle-model', 'E2E Racer');
  await page.fill('#vehicle-generation', '2025-2026');

  await page.click('.save-button');
  await page.waitForTimeout(1000); // Laisse Firebase traiter

  // Recharge la liste
  await page.click('button:has-text("Actualiser la liste")');
  await page.waitForSelector(`#vehicles-list >> text=${vehicleId}`);

  // Clique sur "Supprimer"
  const deleteBtn = page.locator(`#vehicles-list .vehicle-item:has-text("${vehicleId}") .delete-button`);
  await deleteBtn.click();

  // Accepter la fenêtre de confirmation
  page.once('dialog', dialog => dialog.accept());

  // Attente que le véhicule soit supprimé
  await page.waitForTimeout(1000);
  await expect(page.locator(`#vehicles-list >> text=${vehicleId}`)).toHaveCount(0);
});
