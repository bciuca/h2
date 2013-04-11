exports = module.exports = H2Categories;

function H2Categories() {

}

H2Categories.DINING      = 'dining';
H2Categories.NIGHTLIFE   = 'nightlife';
H2Categories.ARTS        = 'arts';
H2Categories.BEAUTY      = 'beauty';
H2Categories.SHOPPING    = 'shopping';
H2Categories.EDUCATIONAL = 'edu';
H2Categories.ACTIVE      = 'active';
H2Categories.TRANSPORT   = 'transport';
H2Categories.SPORTS      = 'sports';
H2Categories.GAMBLING    = 'gambling';
H2Categories.MUSIC       = 'music';

H2Categories.isValidCategory = function(cat) {
	return cat === H2Categories.DINING
		|| cat === H2Categories.NIGHTLIFE
		|| cat === H2Categories.ARTS
		|| cat === H2Categories.BEAUTY
		|| cat === H2Categories.SHOPPING
		|| cat === H2Categories.EDUCATIONAL
		|| cat === H2Categories.ACTIVE
		|| cat === H2Categories.TRANSPORT
		|| cat === H2Categories.SPORTS
		|| cat === H2Categories.GAMBLING
		|| cat === H2Categories.MUSIC;
}

H2Categories.categories = function() {
	return [dining, nightlife, arts, beauty, shopping, 
			edu, active, transport, sports, gambling,
			music];
}