def prices(menu):
	prices = []
	for item in menu:
		prices.append(item.price)
	return prices


def choose_iter(elements, length):	
	for j in range(length + 1):
		for i in range(len(elements)):
			if j == 1:
				yield (elements[i],)
			else:
				for next in choose_iter(elements[i+1:len(elements)], j-1):
					yield (elements[i],) + next	

def choose(l, k):
	return list(choose_iter(l, k))



class Food:
	def __init__(self, name, price):
		self.name = name
		self.price = price


bread = Food('bread', 2)
food = [bread]
eggs = Food('egg', 3)
food.append(eggs)	
apple = Food('apple', 1)
food.append(apple)

total = 4


prices = prices(food)
combos = choose(food, len(prices))  #combinations of food objects


all_combos = []
for food_group in combos:
	summ = 0
	names = ''
	for food in food_group:
		summ += food.price
		names = names + " " + food.name 
	all_combos.append((summ, names))


def filter_total(x):
	final_combos = []
	for ele in x: 
		if ele[0] <= total:
			final_combos.append(ele)
	return final_combos

filtered = filter_total(all_combos)






