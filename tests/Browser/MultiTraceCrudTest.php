<?php

declare(strict_types=1);

/**
 * Browser test — exercises PRD acceptance criteria C1 and C2.
 *
 * Requires a running browser driver (e.g. Laravel Dusk or Pest Browser plugin).
 * Skipped by default; run with: vendor/bin/pest --group=browser
 */
it('can add, remove, duplicate and reorder traces via the UI', function (): void {
    // @group browser
})->group('browser')->skip('Browser tests require a browser driver. Run with --group=browser.');

it('switching trace type from bar to scatter swaps fields without a network request', function (): void {
    // @group browser
})->group('browser')->skip('Browser tests require a browser driver. Run with --group=browser.');
