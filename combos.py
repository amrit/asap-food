import sys
import json

food = sys.argv[1]
total = float(sys.argv[2])

food = json.loads(food)


def prices(menu):
	prices = []
	for item in menu:
		prices.append(item[u'price'])
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



# class Food:
# 	def __init__(self, name, price):
# 		self.name = name
# 		self.price = price


# bread = Food('bread', 2)
# food = [bread]
# eggs = Food('egg', 3)
# food.append(eggs)	
# apple = Food('apple', 1)
# food.append(apple)


prices = prices(food)

combos = choose(food, len(prices))  #combinations of food objects


all_combos = []
for food_group in combos:
	summ = 0
	names = ''
	for food in food_group:
		summ += float(food[u'price'])
		names = names + ", " + food[u'name'] 
	all_combos.append((summ, names))

#print(all_combos)

def filter_total(x):
	final_combos = []
	for ele in x: 
		if ele[0] <= float(total):
			final_combos.append(ele)
	return final_combos

filtered = str(filter_total(all_combos))
filtered = filtered.replace('(','[').replace(')',']').replace('u\', ', '\'')

print(filtered)






