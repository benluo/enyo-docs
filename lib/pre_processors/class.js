
'use strict';

var helpers = require('../helpers');

exports.process = function (doclet) {
	resolveOutputPath(doclet);
	resolveInheritance(doclet);
	resolveOrder(doclet);
	resolveLink(doclet);
};

function resolveOutputPath (doclet) {
	doclet.outputFilename = 'kind/' + doclet.outputFilename;
}

function resolveInheritance (doclet) {
	var augs = doclet.augments,
		db = helpers.db,
		tmp;
	
	if (augs) {
		doclet.inherits = [];
		while (augs) {
			// is this even possible to augment multiple classes?
			augs = augs[0];
			tmp = db({longname: augs}).first();
			doclet.inherits.unshift(tmp);
			augs = tmp.augments;
		}
	}
}

function resolveLink (doclet) {
	var str;
	
	if (!doclet.internalLink) {
		str = '<a class="kind" href="';
		str += (helpers.linkFor(doclet.longname) || helpers.buildHref(doclet.longname));
		str += ('">' + doclet.longname);
		str += '</a>';
		doclet.internalLink = str;
	}
}

function resolveOrder (doclet) {
	var db = helpers.db;
	
	doclet.properties = db({kind: 'member', memberof: doclet.longname, inherited: {'!is': true}}).order('name asec').get();
	doclet.inheritedProperties = db({kind: 'member', memberof: doclet.longname, inherited: true}).order('name asec').get();
	doclet.methods = db({kind: 'function', memberof: doclet.longname, inherited: {'!is': true}}).order('name asec').get();
	doclet.inheritedMethods = db({kind: 'function', memberof: doclet.longname, inherited: true}).order('name asec').get();
	doclet.statics = db({memberof: doclet.longname, scope: 'static'}).order('name asec').get();
	doclet.events = db({memberof: doclet.longname, kind: 'event', inherited: {'!is': true}}).order('name asec').get();
	doclet.inheritedEvents = db({memberof: doclet.longname, kind: 'event', inherited: true}).order('name asec').get();
	doclet.typedefs = db({kind: 'typedef', memberof: doclet.longname}).order('name asec').get();

	if (doclet.mixes) {
		doclet.mixes.forEach(function (nom, idx) {
			doclet.mixes[idx] = db({longname: nom}).first();
		});
	}
}
