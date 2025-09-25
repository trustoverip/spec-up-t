describe('Legacy collectExternalReferences modules', () => {
	test('fetchTermsFromIndex old path throws informative error', () => {
		expect(() => require('./fetchTermsFromIndex')).toThrow(/removed/);
	});

	test('matchTerm old path throws informative error', () => {
		expect(() => require('./matchTerm')).toThrow(/removed/);
	});

	test('processXTrefsData old path throws informative error', () => {
		expect(() => require('./processXTrefsData')).toThrow(/removed/);
	});
});