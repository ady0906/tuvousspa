var DecisionTree = function(data) {

  this.initial = data.initial;
  this.choices = data.choices;

  /* Return an array of choice objects for the root of the tree */
  this.getInitial = function() {

    if (!this.initial) throw 'DecisionTree: no initial choice(s) specified';
    return this.getChoices(this.initial);

  };

  /* Get full choice data by specific id */
  this.getChoice = function(id) {

    if (!(id in this.choices)) return false;
    if (!('id' in this.choices[id])) this.choices[id].id = id;
    return this.choices[id];

  };

  /* As above, but passing an array of choice IDs */
  this.getChoices = function(idList) {
    if(!idList) return [];
    var list = [];
    for(var i = 0, ln = idList.length; i < ln; i++) {
      var childChoice = this.getChoice(idList[i]);
      list.push(childChoice);
    }
    return list;

  };

  /* Get an array of choice data for a parent id */
  this.getChildren = function(parentId) {

    if (!(parentId in this.choices)) return false;
    if (!('children' in this.choices[parentId])) return false;

    var childIds = this.choices[parentId].children;
    return this.getChoices(childIds);

  };

  /* Get an array of choice data for the parent(s) of an id */
  this.getParents = function(id) {

    var parents = [];
    var node = this.getChoice(id);

    while(node.parent) {
      node = this.getChoice(node.parent);
      parents.unshift(node);
    }

    return parents;

  };

  /* Get just an array of ids for the parents of a specific id */
  this.getParentIds = function(id) {
    var parents = this.getParents(id);
    var parentIds = [];
    for(var i = 0, ln = parents.length; i < ln; i++) {
      parentIds.push(parents[i].id);
    }
    return parentIds;
  };

  /* Get the 'name' prop for the parent of an id */
  this.getParentName = function(id) {
    var parent = this.getParents(id).pop();
    if(!parent) {
      return false;
    } else {
      return parent.name;
    }
  };

  /* Init - insert ids into choice objects, check dups, associate parents, etc */
  this.init = function() {

    var idList = [];
    for(var k in this.choices) {
      if(idList.indexOf(k) !== -1) throw 'DecisionTree: duplicate ID "' + k + '" in choice set';

      var choice = this.getChoice(k);
      choice.id = k;

      var children = this.getChildren(k);
      for(var i = 0; i < children.length; i++) {

        var child = children[i];
        if(child.parent) throw 'DecisionTree: tried to assign parent "' + k + '" to child "' + choice.children[i] + '" which already has parent "' + child.parent + '"';
        child.parent = k;

      }

    }

    console.log('init', this.initial, this.choices);

  };

  this.init();

};


/*** TEST DATA ***/

let data = {
  initial: ["adult", "not-adult"],
  choices: {

    // first level

    "adult": {
      name: "I am an adult",
      children: ["adult-speaking-to-child", "adult-speaking-to-adult"],
    },

      "adult-speaking-to-child": {
        name: "speaking to a child",
        children: ["prince", "not-prince"]
      },

        "prince": {
          name: "this kid is royalty",
          answer: "Vous"
        },

        "not-prince": {
          name: "just a regular kid",
          answer: "Tu"
        },

      "adult-speaking-to-adult": {
        name: "speaking to an adult",
        children: ["friend-lover", "dont-formally-know", "spouse", "father-in-law", "boss", "teacher"]
      },

        "friend-lover": {
          name: "a friend or lover",
          answer: "Tu"
        },

        "dont-formally-know": {
          name: "someone I don't formally know",
          children: ["someone-considerably-older", "about-same-age-or-younger"]
        },

          "someone-considerably-older": {
            name: "considerably older than me",
            answer: "Vous"
          },

          "about-same-age-or-younger": {
            name: "about the same age or younger",
            children: ["i-am-hip", "i-am-conservative"]
          },

            "i-am-hip": {
              name: "I am cool like that",
              answer: "Tu"
            },

            "i-am-conservative": {
              name: "I am conservative",
              children: ["talking-to-peer", "talking-to-superior", "not-sure"]
            },

              "talking-to-peer": {
                name: "I am addressing a peer",
                answer: "Tu"
              },

              "talking-to-superior": {
                name: "I am addressing a superior",
                answer: "Vous"
              },

              "not-sure": {
                name: "I am not sure",
                children: ["feeling-lucky", "feeling-cautious"]
              },

                "feeling-lucky": {
                  name: "I am feeling lucky",
                  answer: "Tu"
                },

                "feeling-cautious": {
                  name: "I am feeling cautious",
                  answer: "Vous"
                },


        "spouse": {
          name: "my spouse",
          children: ["you-are-aristocrats", "just-regular-folks"]
        },

          "you-are-aristocrats": {
            name: "my spouse and I are aristocrats",
            answer: "Vous"
          },

          "just-regular-folks": {
            name: "we are just regular folks",
            answer: "Tu"
          },

        "father-in-law": {
          name: "my father in law",
          answer: "Best to ask"
        },

        "boss": {
          name: "my boss",
          children: ["laidback-company", "stern-office"]
        },

          "laidback-company": {
            name: "I work in a laid back environment",
            answer: "Tu"
          },

          "stern-office": {
            name: "I work somewhere stern",
            children: ["confronting-boss", "all-is-good"]
          },

            "confronting-boss": {
              name: "I am having a showdown with my boss",
              answer: "Tu"
            },

            "all-is-good": {
              name: "just a regular day",
              answer: "Vous"
            },

        "teacher": {
          name: "my teacher",
          children: ["older-teacher", "younger-teacher"]
        },

          "older-teacher": {
            name: "older teacher",
            answer: "Vous"
          },

          "younger-teacher": {
            name: "younger teacher",
            answer: "Tu"
          },

    "not-adult": {
      name: "I am a child",
      children: ["child-speaking-to-adult", "child-speaking-to-child"]
    },



        }
      };

/** TEST CODE **/

$(function() {

  var tree = new DecisionTree(data);
  var $list = $('#choices');
  var $title = $('h1');

  var current_id = null;

  var renderList = function(items) {

    var title = tree.getParentName(items[0].id);
    if(title) {
      $title.text(title);
    } else {
      $title.text('Are you an adult ?');
    }

    $list.empty();
    for(var i = 0; i < items.length; i++) {
      var item = items[i];
      $list.append('<button><a href="#" data-choice="' + item.id + '">' + item.name + '</a></button>');
    }
  };

  var _doInitial = function() {
      var initData = tree.getInitial();
      current_id = null;
      renderList(initData);
  };

  $(document).on('click', '#choices a', function(e) {
    e.preventDefault();
    var choiceId = $(this).data('choice');
    console.log('clicked', choiceId);

    var kids = tree.getChildren(choiceId);
    if(kids) {
      current_id = choiceId;
      renderList(kids);
    }
  });

  $('#back').on('click', function(e) {
    e.preventDefault();
    if(!current_id) return false;
    console.log('back button clicked', current_id);

    var parents = tree.getParents(current_id);

    if(parents.length > 0) {
      var prev_node = parents.pop();
      current_id = prev_node.id;
      renderList(tree.getChildren(prev_node.id));
    } else {
      _doInitial();
    }

  });

  $('#go').on('click', function(e) {
    e.preventDefault();

    var cid = $('#show-id').val();
    if(!cid || !(cid in data,choices)) return false;
    console.log('show parents for', cid);

    var parentData = tree.getParents(cid);
    $('#results').val(JSON.stringify(parentData, null, 4));

  });

  _doInitial();


});
