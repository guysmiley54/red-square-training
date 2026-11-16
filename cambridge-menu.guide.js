// Red Square Cafe Cambridge — menu guide (September 2026 menu)
// Each section is a list of slides. A slide has a heading, an optional red key box, and 0 to 3 cards.
// Card: t title, p price, d what it is, tags, tip. Keep this in step with cambridge-menu.questions.js.
var GUIDE = [
 { id:"breakfast", name:"Breakfast dishes", slides:[
  { h:"The breakfast special", key:["Remember","All breakfast items are $16 before 11am. Upgrades and add-ons go on top. It does not run on public holidays."] },
  { h:"House Made Granola", cards:[{t:"House Made Granola", p:"$16.50", d:"Fruit, nuts, oats, Tassie leatherwood honey, berry compote, yoghurt.", tags:["V","Nuts"]}] },
  { h:"Buttermilk Hotcake Stack", cards:[
     {t:"Classic", p:"$18", d:"Maple syrup and butter.", tags:["V"]},
     {t:"Strawberries & Cream", p:"$18", d:"Warm berry compote and fresh cream.", tags:["V"]},
     {t:"American", p:"$3 extra", d:"Streaky bacon and maple."}],
    key:["Offer it","Add ice cream $3 or double cream $2."] },
  { h:"Everything Smash", cards:[{t:"Everything Smash", p:"$23.50", d:"2 poached eggs, smashed avocado, fresh tomato salsa, everything bagel seasoning, balsamic glaze, sourdough toast.", tags:["V","VGO","GFO"]}],
    key:["Watch out","There is no bagel. It is served on sourdough toast. The seasoning has sesame seeds."] },
  { h:"Brekkie Burger", cards:[{t:"Brekkie Burger", p:"$17", d:"Fried egg, rasher of bacon, BBQ sauce, rocket, cheese, hash brown, brioche bun.", tip:"Add a beef patty $5."}] },
  { h:"\"The Ranch\" Waffle", cards:[{t:"\"The Ranch\" Waffle", p:"$25", d:"Sweet waffle, pulled chicken, 2 rashers of bacon, 2 fried eggs, ranch dressing."}] },
  { h:"Eggs Benedict", cards:[{t:"Eggs Benedict", p:"$22", d:"2 poached eggs, ham, hollandaise sauce, sourdough toast.", tags:["GFO"], tip:"Swap the ham for bacon $3, smoked salmon $6, or spinach."}] },
  { h:"Bacon & Eggs", cards:[{t:"Bacon & Eggs", p:"$18.50", d:"2 eggs your choice, 2 rashers of bacon, sourdough toast.", tags:["GFO","DFO"], tip:"Anything else is an added side."}] },
  { h:"All Day Breakfast", cards:[{t:"All Day Breakfast", p:"$26.50", d:"2 eggs your choice, bacon, grilled tomato, sausage, hash brown, mushrooms, sourdough toast.", tags:["GFO","DFO"]}],
    key:["Watch out","No baked beans on the All Day Breakfast. They are a $5 side."] },
  { h:"Vegetarian big brekky", cards:[{t:"Vegetarian big brekky", p:"No extra charge", d:"Sausage and bacon come off. Wilted spinach and mushrooms go on."}] }
 ]},
 { id:"lunch", name:"Lunch, burgers, snacks and kids", slides:[
  { h:"Chicken Taco Salad", cards:[{t:"Chicken Taco Salad", p:"$25", d:"Chicken breast, cos lettuce, cherry tomato, red onion, guacamole, corn chips, chipotle dressing.", tags:["GF","DF"]}] },
  { h:"Black Sesame Squid", cards:[{t:"Black Sesame Squid", p:"$26.50", d:"Squid rings in egg, breadcrumbs and black sesame seeds, lightly fried. Wombok, orange & pecan salad with saffron & shallot dressing.", tip:"The squid is imported."}],
    key:["Allergy","The salad has pecans, so this dish is a nut allergy risk."] },
  { h:"Prawn Mee Goreng", cards:[{t:"Prawn Mee Goreng", p:"$27.50", d:"Panfried prawns, onion, garlic, hokkien noodles, house sauce.", tags:["Spicy"], tip:"The prawns are imported."}],
    key:["Say it at the table","It is the one lunch dish marked spicy."] },
  { h:"Chicken Parmy", cards:[
     {t:"Chicken Parmy", p:"$26.50", d:"Chicken breast in panko crumb, lightly fried, topped with Napoli sauce, ham and cheese. With chips and salad."},
     {t:"Hawaiian", d:"Napoli sauce, ham, cheese, pineapple."},
     {t:"Aussie", d:"BBQ sauce, bacon, onion, cheese, fried egg."}],
    key:["Watch out","The Aussie is the only parmy with no Napoli sauce and no ham."] },
  { h:"Loaded \"Spuds\"", cards:[
     {t:"House Classic", p:"$19.50", d:"Fried potato, gravy, cheese.", tags:["V"]},
     {t:"Cheesy Bacon", p:"Add $1", d:"Fried potato, bacon, cheese, sour cream, spring onion."},
     {t:"Pulled Pork", p:"Add $4", d:"Fried potato, pulled pork, cheese, pickled red onion, sour cream, guacamole, jalapenos."}] },
  { h:"Fish & Chips", cards:[{t:"Fish & Chips", p:"2 piece $25, 3 piece $27.50", d:"Beer battered flathead fillets, chips, salad, lemon wedge, tartare.", tip:"The flathead is imported. The third piece is only $2.50 more."}] },
  { h:"Red Square Burger and Steak Sandwich", cards:[
     {t:"Red Square Burger", p:"$25", d:"Beef pattie, bacon, American cheese, ketchup, mustard, lettuce, bun. With chips.", tags:["GFO"], tip:"Double beef, double cheese $5."},
     {t:"Steak Sandwich", p:"$29.50", d:"Porterhouse steak, bacon, lettuce, beetroot, cheese, beer battered onion rings, relish, Turkish roll. With chips.", tip:"No egg as standard."}] },
  { h:"Chicken and veggie burgers", cards:[
     {t:"Southern Fried Chicken Burger", p:"$26", d:"Chicken breast, lettuce, tomato, cheese, aioli, burger bun. With chips."},
     {t:"Veggie Burger", p:"$25", d:"Chickpea & lentil patty, tomato, beetroot, pickled red onion, lettuce, relish, swiss cheese, potato bun. With chips.", tags:["V","DFO"]}],
    key:["Offer it","Upgrade any burger or sandwich with bacon or a fried egg, $3 each."] },
  { h:"Snacks", cards:[
     {t:"Fruit Toast", p:"$10", d:"Doorstop fruit loaf with butter.", tags:["V"]},
     {t:"Nachos", p:"$18.50", d:"Corn chips, salsa, cheese, jalapenos, sour cream, guacamole.", tags:["V","G"], tip:"Add pulled pork $6."},
     {t:"Wedges", p:"$15", d:"Seasoned wedges, sour cream, sweet chilli.", tags:["V"]}],
    key:["Watch out","Nachos have no meat as standard, and they come with jalapenos."] },
  { h:"Chips", cards:[{t:"Chips", p:"$11", d:"Chips with tomato sauce.", tags:["V","DF"]}] },
  { h:"Kids: under 12", cards:[
     {t:"Choc Top Waffle", p:"$15", d:"1 sweet waffle, choc ice magic, chocolate ice cream.", tags:["V"]},
     {t:"Kids Eggs on Toast", p:"$13.50", d:"1 slice of white toast, 2 eggs.", tags:["V","GFO"]},
     {t:"Nuggies", p:"$15", d:"Chicken nuggets, chips, tomato sauce."}] },
  { h:"Kids: burger and pizza", cards:[
     {t:"Junior Burger", p:"$18", d:"Beef patty, cheese, tomato sauce. With chips.", tags:["GFO"]},
     {t:"Kids Pizza & Chips", p:"$13.50", d:"Ham & cheese mini pizza with chips."}],
    key:["Remember","The kids menu is for under 12s."] }
 ]},
 { id:"ingredients", name:"Tricky ingredients", slides:[
  { h:"On the breakfast menu", cards:[
     {t:"Leatherwood honey", d:"Honey from leatherwood trees that grow in Tasmania's western rainforests. Strong and floral.", tip:"In the House Made Granola."},
     {t:"Compote", d:"Fruit cooked gently in syrup and served chunky. A coulis is the smooth, strained version.", tip:"Granola and Strawberries & Cream hotcakes."},
     {t:"Hollandaise", d:"A French sauce of egg yolks, butter and lemon. Contains egg and dairy.", tip:"Eggs Benedict, and a $3 condiment."}] },
  { h:"On the Everything Smash", cards:[
     {t:"Everything bagel seasoning", d:"An American mix of sesame seeds, poppy seeds, dried garlic, dried onion and salt."},
     {t:"Balsamic glaze", d:"Italian balsamic vinegar reduced until thick, sweet and syrupy."}],
    key:["Allergy","The seasoning contains sesame."] },
  { h:"American and Mexican", cards:[
     {t:"Ranch dressing", d:"A creamy American dressing of buttermilk, herbs and garlic. Contains dairy.", tip:"On \"The Ranch\" Waffle."},
     {t:"Chipotle", d:"A smoked, dried jalapeno chilli from Mexico. Smoky more than fiery.", tip:"Chicken Taco Salad, and a $3 condiment."},
     {t:"Guacamole", d:"A Mexican dip of mashed avocado with lime, onion and coriander.", tip:"Taco Salad, Pulled Pork spuds and Nachos."}] },
  { h:"On the squid", cards:[
     {t:"Wombok", d:"Chinese cabbage, with long pale crinkly leaves. Mild and crunchy."},
     {t:"Saffron", d:"A golden spice made from the threads of a crocus flower. The yellow root is turmeric, a different thing."},
     {t:"Pecan", d:"A tree nut from North America, similar to a walnut."}],
    key:["Allergy","Pecans are tree nuts and the crumb has sesame, egg and gluten."] },
  { h:"Prawn Mee Goreng", cards:[
     {t:"Mee goreng", d:"Malay and Indonesian for fried noodles. Nasi goreng is the fried rice version."},
     {t:"Hokkien noodles", d:"Thick yellow noodles made from wheat, usually with egg. They contain gluten."}] },
  { h:"Crumb, sauce and leaves", cards:[
     {t:"Napoli sauce", d:"An Italian style tomato sauce, named for Naples.", tip:"On the standard and Hawaiian parmy."},
     {t:"Panko", d:"A light, flaky Japanese style breadcrumb. Made from wheat, so it contains gluten.", tip:"The Chicken Parmy crumb."},
     {t:"Cos and rocket", d:"Cos is the crisp lettuce with long upright leaves. Rocket is a small peppery leaf.", tip:"Cos in the Taco Salad. Rocket on the Brekkie Burger."}] },
  { h:"Burger words", cards:[
     {t:"Porterhouse", d:"A steak cut from the striploin, also known as sirloin.", tip:"The Steak Sandwich."},
     {t:"Brioche", d:"A French bread enriched with butter and eggs. Soft and slightly sweet.", tip:"The Brekkie Burger bun."},
     {t:"American cheese", d:"A mild processed cheese slice that melts smoothly.", tip:"On the Red Square Burger."}] },
  { h:"Sauces", cards:[
     {t:"Tartare", d:"A mayonnaise based sauce with chopped pickles and herbs. Contains egg.", tip:"With the Fish & Chips."},
     {t:"Aioli", d:"Garlic mayonnaise.", tip:"Southern Fried Chicken Burger, and a $3 condiment."},
     {t:"Worcestershire", d:"A fermented English sauce. The traditional recipe contains anchovies.", tip:"A free condiment."}],
    key:["Watch out","Check the Worcestershire label before telling a vegetarian it is fine."] },
  { h:"Sourdough", cards:[{t:"Sourdough", d:"Bread raised with a natural starter. It is still wheat bread.", tip:"On most breakfasts."}],
    key:["Watch out","Sourdough contains gluten, so offer the gluten free option."] },
  { h:"Where the seafood is from", cards:[
     {t:"Smoked salmon", p:"(A) Australian", d:"On the Benedict swap and as a side."},
     {t:"Squid, prawns, flathead", p:"(I) Imported", d:"Black Sesame Squid, Prawn Mee Goreng and Fish & Chips."}],
    key:["The codes","(A) Australian, (I) Imported, (M) Mixed origin."] }
 ]},
 { id:"addons", name:"Add-ons and pricing policy", slides:[
  { h:"The rule on swaps", key:["No free swaps","Any substitute or addition is at extra cost. We cannot provide complimentary swaps. That holds even when the item coming off costs the same."] },
  { h:"Sides", cards:[
     {t:"$5 sides", d:"Mushroom, tomato, spinach, baked beans."},
     {t:"$6 sides", d:"Bacon, sausage, pulled pork, avocado, hash browns."},
     {t:"$7 side", d:"Smoked salmon."}] },
  { h:"Condiments", cards:[
     {t:"$3 each", d:"Hollandaise, sour cream, tomato relish, aioli, chipotle, maple syrup, gravy."},
     {t:"On the house", d:"Tomato sauce, BBQ, sweet chilli, white vinegar, Worcestershire."}],
    key:["Watch out","Tomato sauce is free. Tomato relish is $3."] },
  { h:"Upgrades on breakfast", cards:[
     {t:"Eggs Benedict", d:"Swap the ham for bacon $3 or smoked salmon $6. Spinach is also a swap."},
     {t:"Brekkie Burger", d:"Add a beef patty $5."},
     {t:"Hotcake Stack", d:"American $3 extra. Add ice cream $3 or double cream $2."}],
    key:["Built in","The Vegetarian big brekky is no extra charge."] },
  { h:"Upgrades at lunch", cards:[
     {t:"Burgers and sandwiches", d:"Bacon or a fried egg, $3 each. Double beef, double cheese on the Red Square Burger $5."},
     {t:"Loaded Spuds", d:"House Classic $19.50. Cheesy Bacon $20.50. Pulled Pork $23.50."},
     {t:"Nachos", d:"Add pulled pork $6."}],
    key:["Two prices each","Bacon is $6 as a side and $3 as a burger upgrade or Benedict swap. Smoked salmon is $7 as a side and $6 as a Benedict swap."] },
  { h:"Specials, surcharges and hours", cards:[
     {t:"Breakfast special", d:"All breakfast items $16 before 11am. Upgrades and add-ons are charged on top."},
     {t:"Public holidays", d:"10% surcharge, and the breakfast and lunch specials do not run."},
     {t:"Dine-in menu", d:"8am to 3pm, 7 days a week."}] },
  { h:"Worked examples: on the special", cards:[
     {t:"All Day Breakfast, 9am", p:"$16", d:"It is $26.50 after 11am."},
     {t:"Eggs Benedict with smoked salmon, 10am", p:"$22", d:"$16 special + $6 swap. After 11am it is $22 + $6 = $28."},
     {t:"Brekkie Burger with a beef patty, 8:30am", p:"$21", d:"$16 special + $5 patty."}] },
  { h:"Worked examples: hotcakes", cards:[
     {t:"American stack, 9:30am", p:"$19", d:"$16 special + $3 for the American."},
     {t:"American stack with ice cream, midday", p:"$24", d:"$18 + $3 American + $3 ice cream."}] },
  { h:"Worked examples: when the special stops", cards:[
     {t:"Bacon & Eggs at 11:20am", p:"$18.50", d:"The breakfast special ended at 11am."},
     {t:"2 piece Fish & Chips, public holiday", p:"$27.50", d:"$25 plus the 10% surcharge."},
     {t:"Side of bacon on the special", p:"$6", d:"Add-ons are priced as listed, special or not."}] },
  { h:"Worked example: a swap", cards:[{t:"Swap mushrooms for avocado on an All Day Breakfast", p:"$6", d:"The avocado is charged as a $6 side, even though the mushrooms come off."}],
    key:["No free swaps","The item going on is always charged at its listed price."] }
 ]},
 { id:"dietary", name:"Dietary and allergens", slides:[
  { h:"Severe allergies", key:["Never promise allergen free","The kitchen uses shared equipment, so traces of meat, seafood, dairy, gluten, nuts and other allergens may be present. Always tell the kitchen about an allergy."] },
  { h:"Codes: as served", cards:[
     {t:"V and VG", d:"V is vegetarian. VG is vegan."},
     {t:"G or GF", d:"Gluten free as served."},
     {t:"DF", d:"Dairy free as served."}] },
  { h:"Codes: on request", cards:[
     {t:"GFO", d:"A gluten free option is available on request. The dish is not gluten free as listed."},
     {t:"DFO", d:"A dairy free option is available on request."},
     {t:"VGO", d:"A vegan option is available on request. On the Everything Smash."}],
    key:["Remember","Options and substitutes are at extra cost, allergy or not."] },
  { h:"Nuts and sesame", cards:[
     {t:"House Made Granola", d:"Made with nuts."},
     {t:"Black Sesame Squid", d:"The salad has pecans, which are tree nuts."},
     {t:"Sesame", d:"Everything Smash (the seasoning) and Black Sesame Squid (the crumb)."}] },
  { h:"Gluten", cards:[
     {t:"Gluten free as served", d:"Chicken Taco Salad (GF) and Nachos (G)."},
     {t:"Gluten free option", d:"Everything Smash, Eggs Benedict, Bacon & Eggs, All Day Breakfast, Red Square Burger, Kids Eggs on Toast, Junior Burger."},
     {t:"No option listed", d:"Black Sesame Squid is crumbed in breadcrumbs."}] },
  { h:"Dairy", cards:[
     {t:"Dairy free as served", d:"Chicken Taco Salad and Chips."},
     {t:"Dairy free option", d:"Bacon & Eggs, All Day Breakfast and the Veggie Burger."},
     {t:"Eggs Benedict", d:"Hollandaise is made with butter, and the dish is not marked DFO."}] },
  { h:"Vegetarian", cards:[
     {t:"Veggie Burger", d:"Vegetarian with a dairy free option. It comes with swiss cheese, so it is not vegan as listed."},
     {t:"Snacks", d:"Nachos, Wedges, Chips and Fruit Toast are vegetarian. Only Chips are also dairy free."},
     {t:"House Classic spuds", d:"Marked vegetarian."}] },
  { h:"Seafood and milks", cards:[
     {t:"Shellfish", d:"The Prawn Mee Goreng has prawns. Squid and fish are seafood too, and the kitchen equipment is shared."},
     {t:"Milk swaps", d:"Soy, almond, oat and lactose free milk are 80c extra."}],
    key:["Watch out","Lactose free milk is still dairy. Almond milk is a tree nut."] }
 ]},
 { id:"drinks", name:"Drinks", slides:[
  { h:"Coffee and tea", cards:[
     {t:"Coffee, hot choc, chai", p:"$5.30 / $5.80 / $6.50", d:"Small, medium, large. Soy, almond, oat and lactose free milk are 80c extra.", tip:"A large oat latte is $7.30."},
     {t:"Iced latte or long black", p:"$5.50", d:"Served over ice."},
     {t:"Tea Drop tea", p:"$5", d:"A pot for one. English breakfast, earl grey, spring green, ginger & lemongrass, peppermint."}],
    key:["Chai","Indian spiced tea, usually black tea with cinnamon, cardamom, ginger and clove."] },
  { h:"Cool Change: Cold Foam", cards:[
     {t:"Cappuccino", p:"$8.50", d:"Double shot espresso, ice, milk of your choice, cold foam, choc sprinkle."},
     {t:"Bounty", p:"$8.50", d:"Choc drizzle, coconut milk, ice, vanilla cold foam, shaved coconut."}],
    key:["Cold foam","Milk frothed cold into a thick foam that sits on top of the drink."] },
  { h:"Cool Change: Refresher", cards:[
     {t:"Raspberry", p:"$7", d:"Raspberry coulis, ice, lemonade, freeze-dried raspberries, mint.", tip:"Coulis is a smooth fruit sauce."},
     {t:"Peach", p:"$7", d:"Peach puree, ice, lemonade, dried peach."}] },
  { h:"Shakes and blended", cards:[
     {t:"Milkshakes", p:"$7.50", d:"Thickshakes are $8.50. Chocolate, strawberry, vanilla, caramel, lime, banana, spearmint, blue heaven, coffee, chai."},
     {t:"Malteser Thickshake", p:"$9", d:"Malted chocolate thickshake, whipped cream and Maltesers."},
     {t:"Iced choc, coffee, mocha", p:"$9", d:"Frappes are $8: coffee, mocha, chocolate, caramel."}] },
  { h:"Ultrashakes, part 1", cards:[
     {t:"Biscoff Deluxe", p:"$10", d:"Biscoff sauce, crushed Biscoff, whipped cream, Biscoff drizzle, a Biscoff cookie.", tip:"Biscoff is a Belgian caramelised spiced biscuit. It contains gluten."},
     {t:"Honeycomb Crunch", p:"$10", d:"Honeycomb syrup, chocolate, crushed honeycomb, whipped cream."},
     {t:"Cookies & Cream", p:"$10", d:"Chocolate ganache, crushed Oreos, whipped cream, an Oreo cookie."}] },
  { h:"Ultrashakes, part 2", cards:[
     {t:"White Chocolate & Raspberry", p:"$10", d:"White chocolate ganache, raspberry coulis, whipped cream, raspberry lollies."},
     {t:"Peppermint Choc Chip", p:"$10", d:"Spearmint syrup, grated chocolate, whipped cream, peppermint candy."}] },
  { h:"Smoothies", cards:[
     {t:"Mango Pash", p:"$9", d:"Mango, passionfruit, banana, vanilla yoghurt."},
     {t:"Red Square Berry Blast", p:"$9", d:"Strawberry, raspberry, blueberry, honey, vanilla yoghurt."},
     {t:"Green Machine", p:"$8.50", d:"Spinach, cucumber, banana."}],
    key:["Watch out","The Green Machine is the only smoothie with no yoghurt."] },
  { h:"Bananarama", cards:[{t:"Bananarama", p:"$8.50", d:"Banana, vanilla yoghurt, honey, milk."}],
    key:["Honey","The Berry Blast and Bananarama both have honey. Worth knowing for vegans."] },
  { h:"Soft drinks and juice", cards:[
     {t:"Classic soda range", p:"$5", d:"Pepsi, Pepsi Max, Solo, lemonade, orange & mango, mineral water."},
     {t:"Juice", p:"$5.50", d:"Orange, apple, pineapple."},
     {t:"Lemon, Lime & Bitters", p:"$5.50", d:"Priced with the juices, not the soda range."}],
    key:["If they ask for a Coke","We stock Pepsi and Pepsi Max. Offer those."] },
  { h:"Beer and cider", cards:[
     {t:"Beer", d:"Boags Premium Light $8. Great Northern Super Crisp $9. Cascade Lager $9.50. Corona $10. Balter XPA $10.50."},
     {t:"Cider and pre-mix", d:"Somersby Apple Cider $10. CC & Cola (Canadian Club) $11."}] },
  { h:"Wine by the glass", cards:[
     {t:"White and sparkling", d:"Tatachilla Sav Blanc $9.50. Kumeu Pinot Gris $11. Hardy's Chardonnay $9. Tatachilla Sparkling $9.50."},
     {t:"Red", d:"Tatachilla Shiraz Cabernet $9.50."},
     {t:"Mimosa", p:"$8.50", d:"Sparkling and orange."}] }
 ]}
];
