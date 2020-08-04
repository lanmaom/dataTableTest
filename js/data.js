var _list = [];

// 行
for (var i = 0; i < 192; i++) {
	// 列
	for (var m = 0; m < 192; m++) {
		_list.push({
			CU: i,
			SG: '--',
			VolumeCapacity: 123,
			address: '5000',
			colNum: m, //列下标,从零开始 ++
			remain_pct: 100.0,
			rowNum: i, //行下标,从零开始 ++
			state: 'ENABLED',
			usageQuantity: 55544,
			volumeLabel: i + ',' + m,
		});
	}
}
console.log(_list);

Mock.mock(RegExp('http://129.2.1.3' + '/all' + '.*'), 'get', {
	menus: {
		data: _list,
		equipment: [
			{
				CU: '50c0', // 跟CU一样
				DM: 'SPD1(HNH81)', // 最上面大标题
			},
		],
		point: ['dasfl'],
	},
});
Mock.mock(RegExp('http://129.2.1.4' + '/title' + '.*'), 'get', [
	{
		cname: '\u5916\u9ad8\u6865',
		name: 'PLEXPP1',
	},
	{
		cname: '\u5609\u5b9a',
		name: 'PLEXPP2',
	},
	{
		cname: '\u5176\u5b83',
		name: 'OTHER',
	},
]);
Mock.mock(RegExp('http://129.2.1.4' + '/select' + '.*'), 'get', {
	data: [
		{
			name: 'DDDGGG',
		},
	],
});
