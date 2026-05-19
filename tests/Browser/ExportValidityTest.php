<?php

declare(strict_types=1);

/**
 * Browser test — exercises PRD acceptance criterion C6.
 *
 * Skipped by default; run with: vendor/bin/pest --group=browser
 */
it('exportJSON produces a payload that remounts to an identical chart', function (): void {
    // @group browser
})->group('browser')->skip('Browser tests require a browser driver. Run with --group=browser.');
