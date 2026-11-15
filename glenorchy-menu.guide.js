// Red Square Cafe Glenorchy — menu guide (September 2026 menu)
// Each section is a list of slides. A slide has a heading, an optional red key box, and 0 to 3 cards.
// Card: t title, p price, d what it is, tags, tip. Keep this in step with glenorchy-menu.questions.js.
var GUIDE = [
 { id:"breakfast", name:"Breakfast dishes", slides:[
  { h:"The breakfast special", key:["Remember","All breakfast items are $16 before 11am. Upgrades and add-ons go on top. It does not run on public holidays."] },
  { h:"Canadian Breakfast", cards:[{t:"Canadian Breakfast", p:"$25", d:"2 pancakes, 2 bacon rashers, scrambled eggs, hash brown, maple syrup."}] },
  { h:"Mexican SMASH", cards:[{t:"Mexican SMASH", p:"$25", d:"Thick tortilla, smashed avocado, scrambled eggs, pico de gallo, herb oil, dukkah.", tags:["V","Nuts","Seeds"]}] },
  { h:"Chilli SCRAM", cards:[{t:"Chilli SCRAM", p:"$19.50", d:"Thick tortilla, scrambled eggs, hollandaise, fermented chilli oil, herb oil, dukkah. Heat is 5 out of 10.", tags:["Nuts"], tip:"Offer pulled pork for $6."}],
    key:["SMASH or SCRAM?","Both have thick tortilla, scrambled eggs, herb oil and dukkah. The SMASH adds avocado and pico de gallo. The SCRAM adds hollandaise and fermented chilli oil."] },
  { h:"Apple Crumble French Toast", cards:[{t:"Apple Crumble French Toast", p:"$23", d:"Warm apple, biscuit crumb, brioche in egg coating, cinnamon sugar, caramel, custard, ice cream, powdered sugar.", tags:["No alt"]}],
    key:["No alt","Served exactly as listed. No changes and no dietary alternative."] },
  { h:"Bacon & Eggs", cards:[{t:"Bacon & Eggs", p:"$18.50", d:"2 eggs your choice, 2 bacon rashers, sourdough toast.", tags:["GFO","DFO"], tip:"Anything else is an added side."}] },
  { h:"Brekkie Burger", cards:[{t:"Brekkie Burger", p:"$17", d:"Burger bun, fried egg, bacon, hash brown, lettuce, cheese, BBQ sauce.", tip:"Add a sausage patty $3 or a beef patty $6."}] },
  { h:"Eggs Benedict", cards:[{t:"Eggs Benedict", p:"$22", d:"2 poached eggs, sourdough toast, ham, hollandaise, herbed oil.", tags:["GFO"], tip:"Swap the ham for bacon $3 or smoked salmon $6."}] },
  { h:"The BIG Breakfast", cards:[{t:"The BIG Breakfast", p:"$26.50", d:"2 eggs your choice, sourdough toast, bacon, grilled tomato, breakfast sausage, hash brown, mushrooms.", tags:["GFO","DFO"]}],
    key:["Watch out","No baked beans on the BIG Breakfast. They are a $5 side."] },
  { h:"Big brekky swaps", cards:[
     {t:"Vegetarian big brekky", p:"No extra charge", d:"Sausage and bacon come off. Collard greens, smashed avo and roast pumpkin go on."},
     {t:"Carnivore big brekky", p:"Add $7", d:"Tomato and mushrooms come off. Pulled pork, a beef patty and a sausage patty go on."}] }
 ]},
 { id:"lunch", name:"Lunch, burgers and lighter options", slides:[
  { h:"The parmy lunch special", key:["Remember","Any Chicken Parmy is $22 from 11am to 2pm, Monday to Friday. That covers the standard, Hawaiian and Mexican. It does not run on public holidays."] },
  { h:"Fish & Chips", cards:[{t:"Fish & Chips", p:"2 piece $25, 3 piece $27.50", d:"Beer battered flathead, lemon wedge, tartare sauce, salad, chips.", tip:"The flathead is imported. The third piece is only $2.50 more."}] },
  { h:"Caesar Salad", cards:[{t:"Caesar Salad", p:"$22.50", d:"Cos lettuce, croutons, shaved parmesan, bacon, poached egg, dressing.", tags:["GFO"], tip:"Add warm chicken $5 or smoked salmon $6.50."}],
    key:["Watch out","There is no chicken on the standard Caesar."] },
  { h:"Chicken & Bacon Ranch Salad", cards:[{t:"Chicken & Bacon Ranch Salad", p:"$25", d:"Southern style chicken pieces, bacon, beetroot, corn, grated cheese, slaw, cos lettuce, ranch dressing."}] },
  { h:"Gyros", cards:[
     {t:"Lamb Gyro", p:"$25", d:"2 medium thick style wraps, grilled marinated lamb, lettuce, salsa, tzatziki.", tags:["No alt"]},
     {t:"Chicken Gyro", p:"$25", d:"2 medium thick style wraps, chicken breast, lettuce, lemon & herb mayo.", tags:["No alt"]}],
    key:["Tell them apart","Lamb comes with tzatziki. Chicken comes with lemon & herb mayo. Both are 2 wraps."] },
  { h:"Chicken Parmy", cards:[
     {t:"Chicken Parmy", p:"$26.50", d:"Chicken breast in panko crumb, lightly fried, topped with Napoli sauce, ham and cheese. With chips and salad."},
     {t:"Hawaiian", d:"Napoli sauce, ham, cheese, pineapple."},
     {t:"Mexican", d:"Salsa, corn chips, cheese, sour cream, avocado."}],
    key:["Watch out","The Mexican is the only parmy with no Napoli sauce and no ham."] },
  { h:"Beef burgers", cards:[
     {t:"Cheese & Bacon Burger", p:"$25", d:"Angus beef patty, bacon, American cheese, burger sauce, lettuce, burger bun. With chips."},
     {t:"ANGUS Beef Burger with the LOT", p:"$27.50", d:"Angus beef patty, egg, bacon, cheese, onion rings, mayo, beetroot, tomato, lettuce, burger bun. With chips.", tip:"No pineapple."}] },
  { h:"Southern Fried Chicken Burger", cards:[{t:"Southern Fried Chicken Burger", p:"$26", d:"Free range chicken breast, American cheese, mayo, slaw, burger bun. With chips."}] },
  { h:"Melt and toastie", cards:[
     {t:"PATTY Melt", p:"$20", d:"Smashed Angus beef patty, American cheese, onion jam, thick cut bread.", tip:"A toasted sandwich, not a burger."},
     {t:"BBQ Fried Chicken MEGA Toastie", p:"$23.50", d:"Free range chicken breast, American cheese, BBQ sauce, pineapple, bacon, thick cut bread."}],
    key:["Watch out","The menu does not list chips with either of these."] },
  { h:"Lighter options: toast and eggs", cards:[
     {t:"Toast", p:"$7", d:"Sourdough, white, wholemeal or gluten free. Buttered, spreads available.", tags:["V","GFO","DFO"]},
     {t:"Fruit Toast", p:"$10", d:"Thick cut, buttered, spreads available.", tags:["V","DFO"]},
     {t:"Eggs on Toast", p:"$15.50", d:"Sourdough toast, 2 eggs your choice.", tags:["V","GFO","DFO"]}] },
  { h:"Lighter options: sweet and share", cards:[
     {t:"Sweet Pancake", p:"$15", d:"2 pancakes, butter, maple syrup, vanilla ice cream, powdered sugar.", tags:["V"]},
     {t:"Spring Rolls", p:"$13.50", d:"3 HAKKA spring rolls with sweet chilli.", tags:["V","DF"]},
     {t:"Nachos", p:"$18.50", d:"Corn chips, tomato salsa, grilled cheese, sour cream, avocado.", tags:["V","GF"], tip:"Add pulled pork $6."}],
    key:["Watch out","Nachos have no meat as standard."] },
  { h:"Lighter options: fried", cards:[
     {t:"Nuggets", p:"$15", d:"Dinosaur chicken nuggets, chips, sauce."},
     {t:"Chips", p:"$11", d:"Chips with tomato sauce.", tags:["V","DF"]},
     {t:"Wedges", p:"$15", d:"Battered wedges, sour cream, sweet chilli sauce.", tags:["V","DFO"]}] }
 ]},
 { id:"ingredients", name:"Tricky ingredients", slides:[
  { h:"On the tortilla dishes", cards:[
     {t:"Pico de gallo", d:"A fresh, uncooked Mexican salsa of chopped tomato, onion, coriander, chilli and lime.", tip:"On the Mexican SMASH."},
     {t:"Dukkah", d:"An Egyptian blend of crushed nuts, seeds and spices.", tip:"On the Mexican SMASH and Chilli SCRAM."},
     {t:"Hollandaise", d:"A French sauce of egg yolks, butter and lemon. Contains egg and dairy.", tip:"Eggs Benedict, Chilli SCRAM, and a $3 condiment."}],
    key:["Allergy","Dukkah is nuts and seeds. Both tortilla dishes are a nut and seed allergy risk."] },
  { h:"Greens and Greek", cards:[
     {t:"Collard greens", d:"A leafy green from the cabbage family, popular in the American South.", tip:"A $5 side, and on the Vegetarian big brekky."},
     {t:"Tzatziki", d:"A Greek sauce of yoghurt, cucumber and garlic. Contains dairy.", tip:"On the Lamb Gyro."},
     {t:"Gyro", d:"A Greek dish of meat in a flatbread wrap with salad and sauce.", tip:"Lamb Gyro and Chicken Gyro."}] },
  { h:"Crumb, sauce and bread", cards:[
     {t:"Napoli sauce", d:"An Italian style tomato sauce, named for Naples.", tip:"On the standard and Hawaiian parmy."},
     {t:"Panko", d:"A light, flaky Japanese style breadcrumb. Made from wheat, so it contains gluten.", tip:"The Chicken Parmy crumb."},
     {t:"Brioche", d:"A French bread enriched with butter and eggs. Soft and slightly sweet.", tip:"The Apple Crumble French Toast."}] },
  { h:"Salad and sauces", cards:[
     {t:"Cos lettuce", d:"A crisp lettuce with long upright leaves. The classic Caesar lettuce.", tip:"Caesar and Chicken & Bacon Ranch Salad."},
     {t:"Tartare sauce", d:"A mayonnaise based sauce with chopped pickles and herbs. Contains egg.", tip:"With the Fish & Chips."},
     {t:"Aioli", d:"Garlic mayonnaise.", tip:"A $3 condiment."}] },
  { h:"Burger words", cards:[
     {t:"Angus", d:"A breed of beef cattle that originated in Scotland.", tip:"The burgers and the PATTY Melt."},
     {t:"Onion jam", d:"Onions cooked slowly until sweet and sticky.", tip:"In the PATTY Melt."},
     {t:"American cheese", d:"A mild processed cheese slice that melts smoothly.", tip:"Burgers, PATTY Melt and MEGA Toastie."}] },
  { h:"The ones that catch people out", cards:[
     {t:"Worcestershire", d:"A fermented English sauce. The traditional recipe contains anchovies.", tip:"A free condiment."},
     {t:"Sourdough", d:"Bread raised with a natural starter. It is still wheat bread.", tip:"On most breakfasts."},
     {t:"Maple syrup", d:"The boiled down sap of maple trees, most famously from Canada.", tip:"Canadian Breakfast and Sweet Pancake."}],
    key:["Watch out","Sourdough contains gluten, so offer the gluten free option. Check the Worcestershire label before telling a vegetarian it is fine."] },
  { h:"Where the seafood is from", cards:[
     {t:"Flathead", p:"(I) Imported", d:"The fish in the Fish & Chips."},
     {t:"Smoked salmon", p:"(A) Australian", d:"On the Benedict upgrade, the Caesar add-on and as a side."}],
    key:["The codes","(A) Australian, (I) Imported, (M) Mixed origin."] }
 ]},
 { id:"addons", name:"Add-ons and pricing policy", slides:[
  { h:"The rule on swaps", key:["No free swaps","Any substitute or addition is charged at its listed price. That holds even when the item coming off costs the same."] },
  { h:"Sides", cards:[
     {t:"$5 sides", d:"Mushroom, tomato, collard greens, baked beans, roast pumpkin."},
     {t:"$6 sides", d:"Bacon, sausage, pulled pork, avocado, hash browns."},
     {t:"$7 side", d:"Smoked salmon."}] },
  { h:"Condiments", cards:[
     {t:"$3 each", d:"Hollandaise, sour cream, tomato relish, aioli, ranch, maple, gravy, extra butter."},
     {t:"On the house", d:"Tomato sauce, BBQ, sweet chilli, white vinegar, Worcestershire."}],
    key:["Watch out","Tomato sauce is free. Tomato relish is $3."] },
  { h:"Toast swaps", cards:[
     {t:"Croissant", p:"$5", d:"In place of sourdough toast."},
     {t:"Gluten free toast", p:"$3", d:"2 slices, in place of sourdough toast."}] },
  { h:"Upgrades on breakfast", cards:[
     {t:"Eggs Benedict", d:"Swap the ham for bacon $3 or smoked salmon $6."},
     {t:"Brekkie Burger", d:"Add a sausage patty $3 or a beef patty $6."},
     {t:"The BIG Breakfast", d:"Vegetarian no extra charge. Carnivore add $7."}] },
  { h:"Upgrades to offer", cards:[
     {t:"Chilli SCRAM and Nachos", d:"Add pulled pork $6."},
     {t:"Caesar Salad", d:"Add warm chicken $5 or smoked salmon $6.50."},
     {t:"Fish & Chips", d:"The third piece is only $2.50 more."}],
    key:["Smoked salmon has three prices","$7 as a side. $6 as a Benedict swap. $6.50 on a Caesar."] },
  { h:"Specials and surcharges", cards:[
     {t:"Breakfast special", d:"All breakfast items $16 before 11am. Upgrades and add-ons are charged on top."},
     {t:"Parmy lunch special", d:"Any parmy $22, 11am to 2pm, Monday to Friday."},
     {t:"Public holidays", d:"10% surcharge, and neither special runs."}] },
  { h:"Cabinet items", cards:[{t:"Cakes, slices, toasties and wraps", d:"These are ready to go, so they may come out at a different time to the dine-in meals."}],
    key:["Say it at the table","Let the table know when they order a cabinet item with mains."] },
  { h:"Worked examples: specials", cards:[
     {t:"Carnivore big brekky, 9am weekday", p:"$23", d:"$16 special + $7 upgrade. At midday it is $26.50 + $7 = $33.50."},
     {t:"Eggs Benedict with smoked salmon, 10am", p:"$22", d:"$16 special + $6 swap. After 11am it is $22 + $6 = $28."},
     {t:"Chilli SCRAM with pulled pork, 8:30am", p:"$22", d:"$16 special + $6 pulled pork."}] },
  { h:"Worked examples: when specials stop", cards:[
     {t:"Bacon & Eggs at 11:20am", p:"$18.50", d:"The breakfast special ended at 11am."},
     {t:"Chicken Parmy, 12:30pm Saturday", p:"$26.50", d:"The lunch special is weekdays only."},
     {t:"2 piece Fish & Chips, public holiday", p:"$27.50", d:"$25 plus the 10% surcharge."}] },
  { h:"Worked example: a swap", cards:[{t:"Swap mushrooms for avocado on a BIG Breakfast", p:"$6", d:"The avocado is charged as a $6 side, even though the mushrooms come off."}],
    key:["No free swaps","The item going on is always charged at its listed price."] }
 ]},
 { id:"dietary", name:"Dietary and allergens", slides:[
  { h:"Severe allergies", key:["Never promise allergen free","The kitchen uses shared equipment, so traces of meat, seafood, dairy, gluten, nuts and other allergens may be present. Always tell the kitchen about an allergy."] },
  { h:"Codes: as served", cards:[
     {t:"V", d:"Vegetarian."},
     {t:"G or GF", d:"Gluten free as served."},
     {t:"DF", d:"Dairy free as served."}] },
  { h:"Codes: on request", cards:[
     {t:"GFO", d:"A gluten free option is available on request. The dish is not gluten free as listed."},
     {t:"DFO", d:"A dairy free option is available on request."},
     {t:"NO ALT", d:"No alterations. Served as listed, with no changes or dietary alternative."}] },
  { h:"Nuts and NO ALT", cards:[
     {t:"Nuts warning", d:"Mexican SMASH and Chilli SCRAM, because of the dukkah."},
     {t:"NO ALT dishes", d:"Apple Crumble French Toast, Lamb Gyro and Chicken Gyro."}] },
  { h:"Eggs Benedict questions", cards:[
     {t:"A coeliac customer", d:"Eggs Benedict is GFO. Gluten free toast is a $3 swap, and you tell the kitchen about the allergy."},
     {t:"A dairy free customer", d:"Hollandaise is made with butter, and the dish is not marked DFO."}] },
  { h:"Lighter options", cards:[
     {t:"Vegetarian and dairy free", d:"Spring Rolls and Chips. Wedges are DFO because of the sour cream."},
     {t:"Nachos", d:"Vegetarian and gluten free, but not dairy free."},
     {t:"Sweet Pancake", d:"Vegetarian only. No gluten free or dairy free option."}] },
  { h:"Drinks", cards:[
     {t:"Vegan", d:"The Mont Blanc is the drink marked vegan."},
     {t:"Tree nut allergy", d:"The Coconut Cold Brew Latte contains almond milk syrup."}],
    key:["Watch out","Coconut is not the only thing in the Coconut Cold Brew Latte. Almond is a tree nut."] }
 ]},
 { id:"drinks", name:"Drinks", slides:[
  { h:"Coffee and tea", cards:[
     {t:"Coffee, hot choc, chai", p:"$5.30 / $5.80 / $6.50", d:"Small, medium, large."},
     {t:"Iced latte or long black", p:"$6", d:"Served over ice."},
     {t:"Sticky chai", p:"$6", d:"Chai is Indian spiced tea, usually black tea with cinnamon, cardamom, ginger and clove."}] },
  { h:"Tea Drop tea", cards:[{t:"Tea Drop tea", p:"$5", d:"A pot for one. English breakfast, earl grey, gunpowder green, ginger & lemongrass, peppermint."}],
    key:["Gunpowder green","A Chinese green tea with the leaves rolled into small pellets. It is not smoky or spicy."] },
  { h:"Iced coffee specials", cards:[
     {t:"Mont Blanc", p:"$8.50", d:"Espresso, brown sugar syrup, layered soy and plant cream, orange zest, over ice.", tags:["Vegan"]},
     {t:"Salted Honey Iced Latte", p:"$7", d:"Espresso, milk, honey and a touch of sea salt, over ice."},
     {t:"Coconut Cold Brew Latte", p:"$8", d:"24 hour cold brew coffee, coconut cream and almond milk syrup, over ice."}] },
  { h:"Soft-serve Affogato", cards:[{t:"Soft-serve Affogato", p:"$7.50", d:"A shot of espresso poured over soft-serve ice cream. Affogato is Italian."}] },
  { h:"Shakes and blended", cards:[
     {t:"Milkshakes", p:"$7.50", d:"Thick shakes are $8.50. Chocolate, strawberry, vanilla, caramel, lime, banana, spearmint, blue heaven, coffee, mocha, chai."},
     {t:"Iced choc, coffee, mocha", p:"$9", d:"Three flavours."},
     {t:"Frappes", p:"$8", d:"Coffee, mocha, chocolate, caramel."}] },
  { h:"Ultrashakes, part 1", cards:[
     {t:"Turkish Delight", p:"$10", d:"Rosewater syrup, grated chocolate, raspberry coulis, whipped cream, Turkish delight.", tip:"Coulis is a smooth fruit sauce."},
     {t:"Biscoff Deluxe", p:"$10", d:"Biscoff sauce, crushed Biscoff, whipped cream, Biscoff drizzle, a Biscoff cookie.", tip:"Biscoff is a Belgian caramelised spiced biscuit. It contains gluten."},
     {t:"Honeycomb Crunch", p:"$10", d:"Honeycomb syrup, chocolate, crushed honeycomb, whipped cream."}] },
  { h:"Ultrashakes, part 2", cards:[
     {t:"Cookies & Cream", p:"$10", d:"Chocolate, crushed Oreos, whipped cream, an Oreo cookie."},
     {t:"White Chocolate & Raspberry", p:"$10", d:"White chocolate, raspberry coulis, whipped cream, raspberry lollies."},
     {t:"Peppermint Choc Chip", p:"$10", d:"Spearmint syrup, grated chocolate, whipped cream, peppermint candy."}] },
  { h:"Smoothies", cards:[
     {t:"Mango Pash", p:"$9", d:"Mango, passionfruit, banana, vanilla yoghurt."},
     {t:"Red Square Berry Blast", p:"$9", d:"Strawberry, raspberry, blueberry, vanilla yoghurt."},
     {t:"Green Machine", p:"$8.50", d:"Spinach, cucumber, banana."}],
    key:["Watch out","The Green Machine is the only smoothie with no yoghurt."] },
  { h:"Soft drinks and juice", cards:[
     {t:"Classic soda range", p:"$5", d:"Pepsi, Pepsi Max, Solo, ginger beer, lemonade, orange & mango, lemon lime & bitters, blood orange, mineral water."},
     {t:"Juice", p:"$5.50", d:"Orange, apple, pineapple."}],
    key:["If they ask for a Coke","We stock Pepsi and Pepsi Max. Offer those."] }
 ]}
];
