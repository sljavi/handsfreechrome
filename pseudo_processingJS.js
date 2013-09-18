/*

if in control mode:
	strip all whitespace, break string into list
	if in standard mode:
		if first word is not a command:
			discard
		else:
			process(command);
	if in quick mode:
		for each word:
			if word is a command:
				process(command);
				discard the rest
			else, discard


*/